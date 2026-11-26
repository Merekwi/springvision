-- Server-side quality safeguards for SpringVision.
-- Prevent duplicate songs even if two submissions arrive at nearly the same time.
CREATE OR REPLACE FUNCTION public.springvision_song_key(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $function$
  SELECT regexp_replace(
    lower(normalize(coalesce(value, ''), NFKC)),
    '[^[:alnum:]]',
    '',
    'g'
  );
$function$;

CREATE UNIQUE INDEX IF NOT EXISTS submissions_unique_active_song_per_season
ON public.submissions (season_id, public.springvision_song_key(song_title))
WHERE status IN ('pending', 'approved');

-- Replace a jury ballot atomically: a failed insert rolls back the deletion too.
CREATE OR REPLACE FUNCTION public.replace_springvision_jury_ballot(
  p_season_id uuid,
  p_juror_id uuid,
  p_votes jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  vote_count integer;
  unique_points integer;
  unique_targets integer;
BEGIN
  IF p_votes IS NULL OR jsonb_typeof(p_votes) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'A jury ballot must be a JSON array' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_votes) <> 10 THEN
    RAISE EXCEPTION 'A jury ballot must contain exactly 10 votes' USING ERRCODE = '22023';
  END IF;

  SELECT
    count(*)::integer,
    count(DISTINCT (item.value->>'points')::integer)::integer,
    count(DISTINCT (item.value->>'submissionId')::uuid)::integer
  INTO vote_count, unique_points, unique_targets
  FROM jsonb_array_elements(p_votes) AS item(value);

  IF vote_count <> 10 OR unique_points <> 10 OR unique_targets <> 10 THEN
    RAISE EXCEPTION 'A jury ballot must contain 10 different targets and 10 different scores' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.jury_votes
  WHERE season_id = p_season_id
    AND juror_id = p_juror_id
    AND is_random_fallback = false;

  INSERT INTO public.jury_votes (
    season_id, juror_id, target_submission_id, points, is_random_fallback
  )
  SELECT
    p_season_id,
    p_juror_id,
    (item.value->>'submissionId')::uuid,
    (item.value->>'points')::integer,
    false
  FROM jsonb_array_elements(p_votes) AS item(value);
END;
$function$;

REVOKE ALL ON FUNCTION public.replace_springvision_jury_ballot(uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_springvision_jury_ballot(uuid, uuid, jsonb) TO service_role;

-- The trigger only uses NEW and now(), so an empty search_path is sufficient.
ALTER FUNCTION public.set_updated_at() SET search_path = '';

CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS jury_votes_target_submission_id_idx ON public.jury_votes(target_submission_id);
CREATE INDEX IF NOT EXISTS televote_points_target_submission_id_idx ON public.televote_points(target_submission_id);
