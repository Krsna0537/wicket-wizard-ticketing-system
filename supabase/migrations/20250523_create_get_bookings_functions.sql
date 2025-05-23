
-- Function to get user bookings with details
CREATE OR REPLACE FUNCTION public.get_user_bookings_with_details()
RETURNS TABLE (
  id uuid,
  booking_date timestamptz,
  amount decimal,
  payment_status text,
  booking_status text,
  ticket_code text,
  match jsonb,
  seat_info jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
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
    ) as match,
    jsonb_build_object(
      'row_number', s.row_number,
      'seat_number', s.seat_number,
      'stand_name', st.name,
      'stadium_name', stad.name
    ) as seat_info
  FROM 
    bookings b
    JOIN matches m ON b.match_id = m.id
    JOIN match_seats ms ON b.match_seat_id = ms.id
    JOIN seats s ON ms.seat_id = s.id
    JOIN stands st ON s.stand_id = st.id
    JOIN stadiums stad ON st.stadium_id = stad.id
  WHERE
    b.user_id = auth.uid()
  ORDER BY b.booking_date DESC;
$$;

-- Function to get all bookings with details (for admin)
CREATE OR REPLACE FUNCTION public.get_all_bookings_with_details()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  booking_date timestamptz,
  amount decimal,
  payment_status text,
  booking_status text,
  ticket_code text,
  user_email text,
  match jsonb,
  seat_info jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    b.id,
    b.user_id,
    b.booking_date,
    b.amount,
    b.payment_status,
    b.booking_status,
    b.ticket_code,
    (SELECT email FROM auth.users WHERE id = b.user_id) as user_email,
    jsonb_build_object(
      'id', m.id,
      'team_a', m.team_a,
      'team_b', m.team_b,
      'match_date', m.match_date
    ) as match,
    jsonb_build_object(
      'row_number', s.row_number,
      'seat_number', s.seat_number,
      'stand_name', st.name,
      'stadium_name', stad.name
    ) as seat_info
  FROM 
    bookings b
    JOIN matches m ON b.match_id = m.id
    JOIN match_seats ms ON b.match_seat_id = ms.id
    JOIN seats s ON ms.seat_id = s.id
    JOIN stands st ON s.stand_id = st.id
    JOIN stadiums stad ON st.stadium_id = stad.id
  ORDER BY b.booking_date DESC;
$$;

-- Add RLS policy to allow admins to execute get_all_bookings_with_details function
CREATE POLICY "Allow admins to execute get_all_bookings_with_details"
ON public.bookings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role = 'admin'
));
