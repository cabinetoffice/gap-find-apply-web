INSERT INTO public.gap_users(
	gap_user_id, email, sub, dept_id, login_journey_state)
	VALUES 
	(9001, 'test-user-applicant-1@gov.uk', 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34vMlSr77BBb', null, 'PRIVACY_POLICY_PENDING'),
	(9002, 'test-user-applicant-2@gov.uk', 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34vMlSr88CCc', null, 'PRIVACY_POLICY_PENDING'),
	(9999, 'test.super-admin@gov.uk', 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34vMlSr97YUg', 2, 'USER_READY'),
	(9998, 'test.applicant@gov.uk', 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34vMlSr88AAa', null, 'USER_READY'),
	(9997, 'test.admin@gov.uk', 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34vMlSr22TTt', 2, 'USER_READY');


INSERT INTO public.roles_users(
	roles_id, users_gap_user_id)
	VALUES 
	(1, 9999),
	(2, 9999),
	(3, 9999),
	(4, 9999),
	(1, 9997),
	(2, 9997),
	(3, 9997),
	(1, 9998),
	(2, 9998);