-- Reset and re-seed with Region-Specific housing
truncate table public.lodgings cascade;

insert into public.lodgings (region, name, type, daily_rent, energy_regen_bonus, anointing_bonus, description)
values 
-- NORTH AMERICA (Industry Hub)
('na', 'Community Shelter (Inkster)', 'nomadic', 0.00, 8, 2, 'Safe, shared space provided by local outreach ministries.'),
('na', 'Studio Apartment (Detroit)', 'boarding', 125.00, 25, 5, 'A modest city apartment. Provides stability for your ministry.'),
('na', 'The High-Rise Loft', 'hotel', 250.00, 35, 12, 'Professional living with a skyline view. Great for your image.'),

-- AFRICA (The Fire Center)
('af', 'Believers Hospitality', 'nomadic', 0.00, 15, 10, 'A room offered by a local family. Deep communal fellowship.'),
('af', 'Shared Music House (Lagos)', 'boarding', 45.00, 22, 18, 'Living with other gospel artists. The creative fire is high.'),
('af', 'Ministry Guest Suite', 'sanctuary', 150.00, 45, 30, 'A private suite designed for deep prayer and total restoration.'),

-- EUROPE (The Indie Scene)
('eu', 'The Hostel Bunk', 'nomadic', 15.00, 10, 5, 'Shared lodging in the heart of the city. Cheap but noisy.'),
('eu', 'Acoustic Studio Flat', 'boarding', 140.00, 28, 8, 'A quiet, minimalist flat perfect for focused songwriting.'),
('eu', 'The Cathedral Rectory', 'sanctuary', 220.00, 40, 25, 'Historic lodging with deep roots. Massive integrity boost.'),

-- SOUTH AMERICA (The Celebration Hub)
('sa', 'Neighborhood Mission', 'nomadic', 0.00, 12, 8, 'A welcoming space run by local church volunteers.'),
('sa', 'Suburban Villa', 'boarding', 110.00, 30, 10, 'A peaceful retreat away from the city noise.'),
('sa', 'The Penthouse Sanctuary', 'hotel', 280.00, 45, 20, 'Vibrant luxury with a private prayer garden.');