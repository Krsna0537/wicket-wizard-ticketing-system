
-- Function to get all bookings with details for admin
CREATE OR REPLACE FUNCTION public.get_all_bookings_with_details()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  booking_date TIMESTAMPTZ,
  amount DECIMAL,
  payment_status TEXT,
  booking_status TEXT,
  ticket_code TEXT,
  user_email TEXT,
  match JSONB,
  seat_info JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.user_id,
    b.booking_date,
    b.amount,
    b.payment_status,
    b.booking_status,
    b.ticket_code,
    au.email AS user_email,
    jsonb_build_object(
      'id', m.id,
      'team_a', m.team_a,
      'team_b', m.team_b,
      'match_date', m.match_date
    ) AS match,
    jsonb_build_object(
      'row_number', s.row_number,
      'seat_number', s.seat_number,
      'stand_name', st.name,
      'stadium_name', stad.name
    ) AS seat_info
  FROM
    public.bookings b
    JOIN auth.users au ON b.user_id = au.id
    JOIN public.matches m ON b.match_id = m.id
    JOIN public.match_seats ms ON b.match_seat_id = ms.id
    JOIN public.seats s ON ms.seat_id = s.id
    JOIN public.stands st ON s.stand_id = st.id
    JOIN public.stadiums stad ON st.stadium_id = stad.id
  ORDER BY b.booking_date DESC;
END;
$$;

-- Function to get user bookings with details
CREATE OR REPLACE FUNCTION public.get_user_bookings_with_details()
RETURNS TABLE (
  id UUID,
  booking_date TIMESTAMPTZ,
  amount DECIMAL,
  payment_status TEXT,
  booking_status TEXT,
  ticket_code TEXT,
  match JSONB,
  seat_info JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.booking_date,
    b.amount,
    b.payment_status,
    b.booking_status,
    b.ticket_code,
    jsonb_build_object(
      'id', m.id,
      'team_a', m.team_a,
      'team_b', m.team_b,
      'match_date', m.match_date
    ) AS match,
    jsonb_build_object(
      'row_number', s.row_number,
      'seat_number', s.seat_number,
      'stand_name', st.name,
      'stadium_name', stad.name
    ) AS seat_info
  FROM
    public.bookings b
    JOIN public.matches m ON b.match_id = m.id
    JOIN public.match_seats ms ON b.match_seat_id = ms.id
    JOIN public.seats s ON ms.seat_id = s.id
    JOIN public.stands st ON s.stand_id = st.id
    JOIN public.stadiums stad ON st.stadium_id = stad.id
  WHERE
    b.user_id = auth.uid()
  ORDER BY b.booking_date DESC;
END;
$$;

-- Function to get stand with stadium name
CREATE OR REPLACE FUNCTION public.get_stand_with_stadium_name(stand_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  stadium_id UUID,
  stadium_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.stadium_id,
    st.name AS stadium_name
  FROM
    public.stands s
    JOIN public.stadiums st ON s.stadium_id = st.id
  WHERE
    s.id = stand_id;
END;
$$;
