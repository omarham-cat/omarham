-- ===== SEED DATA =====
-- Run this after migrations to populate the database with sample data

-- Categories
INSERT INTO public.categories (id, name, description, image_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Barfi', 'Traditional milk-based Indian sweets', null),
  ('c1000000-0000-0000-0000-000000000002', 'Ladoo', 'Round ball-shaped sweets made from flour, sugar, and ghee', null),
  ('c1000000-0000-0000-0000-000000000003', 'Halwa', 'Dense, sweet confections made with flour, ghee, and sugar', null),
  ('c1000000-0000-0000-0000-000000000004', 'Dry Fruits & Rolls', 'Premium sweets made with dry fruits and nuts', null),
  ('c1000000-0000-0000-0000-000000000005', 'Mithai Box', 'Assorted sweet boxes for gifting', null);

-- Ingredients
INSERT INTO public.ingredients (id, name, is_allergen) VALUES
  ('i1000000-0000-0000-0000-000000000001', 'Milk', true),
  ('i1000000-0000-0000-0000-000000000002', 'Sugar', false),
  ('i1000000-0000-0000-0000-000000000003', 'Ghee', true),
  ('i1000000-0000-0000-0000-000000000004', 'Almonds', true),
  ('i1000000-0000-0000-0000-000000000005', 'Cashews', true),
  ('i1000000-0000-0000-0000-000000000006', 'Pistachios', true),
  ('i1000000-0000-0000-0000-000000000007', 'Cardamom', false),
  ('i1000000-0000-0000-0000-000000000008', 'Saffron', false),
  ('i1000000-0000-0000-0000-000000000009', 'Besan (Gram Flour)', false),
  ('i1000000-0000-0000-0000-000000000010', 'Wheat Flour', true),
  ('i1000000-0000-0000-0000-000000000011', 'Coconut', true),
  ('i1000000-0000-0000-0000-000000000012', 'Rose Water', false),
  ('i1000000-0000-0000-0000-000000000013', 'Silver Leaf (Vark)', false),
  ('i1000000-0000-0000-0000-000000000014', 'Khoya (Mawa)', true),
  ('i1000000-0000-0000-0000-000000000015', 'Dates', false),
  ('i1000000-0000-0000-0000-000000000016', 'Semolina', true),
  ('i1000000-0000-0000-0000-000000000017', 'Jaggery', false);

-- Products
INSERT INTO public.products (id, category_id, name, description, image_url, calories, is_available) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Kaju Barfi', 'Premium cashew fudge garnished with silver leaf. Melt-in-mouth texture with the rich flavor of roasted cashews.', null, 320, true),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Pista Barfi', 'Delicate pistachio barfi with a beautiful green hue. Made with hand-picked pistachios and pure ghee.', null, 290, true),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Badam Barfi', 'Almond barfi made with blanched almonds, milk, and aromatic cardamom. A classic celebration sweet.', null, 310, true),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Motichoor Ladoo', 'Iconic golden ladoos made from tiny boondi pearls soaked in saffron-infused sugar syrup.', null, 350, true),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Besan Ladoo', 'Traditional gram flour ladoos roasted in pure ghee with cardamom and topped with almonds.', null, 380, true),
  ('p1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'Coconut Ladoo', 'Soft and chewy ladoos made with fresh grated coconut, condensed milk, and cardamom.', null, 260, true),
  ('p1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Gajar Ka Halwa', 'Rich carrot halwa slow-cooked with milk, ghee, and dry fruits. A winter delicacy.', null, 340, true),
  ('p1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 'Moong Dal Halwa', 'Luxurious moong dal halwa made with split green gram, ghee, and garnished with almonds.', null, 400, true),
  ('p1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000003', 'Sooji Halwa', 'Semolina halwa prepared with ghee, sugar, and saffron. Simple yet divine.', null, 300, true),
  ('p1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000004', 'Anjeer Roll', 'Premium fig rolls stuffed with dry fruits and coated with desiccated coconut.', null, 280, true),
  ('p1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000004', 'Kaju Pista Roll', 'Cashew and pistachio rolls with a beautiful layered look. Perfect for gifting.', null, 330, true),
  ('p1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000005', 'Royal Assorted Box', 'Curated box with our finest sweets - Kaju Barfi, Motichoor Ladoo, Pista Barfi, and more.', null, 300, true);

-- Product Variants
INSERT INTO public.product_variants (id, product_id, label, weight_grams, price, stock) VALUES
  -- Kaju Barfi
  ('v1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '250g Box', 250, 350, 50),
  ('v1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', '500g Box', 500, 650, 40),
  ('v1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', '1kg Box', 1000, 1200, 30),
  -- Pista Barfi
  ('v1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000002', '250g Box', 250, 400, 45),
  ('v1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000002', '500g Box', 500, 750, 35),
  ('v1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000002', '1kg Box', 1000, 1400, 25),
  -- Badam Barfi
  ('v1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000003', '250g Box', 250, 380, 50),
  ('v1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000003', '500g Box', 500, 700, 40),
  ('v1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000003', '1kg Box', 1000, 1300, 30),
  -- Motichoor Ladoo
  ('v1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000004', '250g (6 pcs)', 250, 200, 60),
  ('v1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000004', '500g (12 pcs)', 500, 380, 50),
  ('v1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000004', '1kg (24 pcs)', 1000, 720, 40),
  -- Besan Ladoo
  ('v1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000005', '250g (6 pcs)', 250, 180, 60),
  ('v1000000-0000-0000-0000-000000000014', 'p1000000-0000-0000-0000-000000000005', '500g (12 pcs)', 500, 340, 50),
  ('v1000000-0000-0000-0000-000000000015', 'p1000000-0000-0000-0000-000000000005', '1kg (24 pcs)', 1000, 650, 40),
  -- Coconut Ladoo
  ('v1000000-0000-0000-0000-000000000016', 'p1000000-0000-0000-0000-000000000006', '250g (8 pcs)', 250, 160, 55),
  ('v1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000006', '500g (16 pcs)', 500, 300, 45),
  -- Gajar Ka Halwa
  ('v1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000007', '250g', 250, 220, 40),
  ('v1000000-0000-0000-0000-000000000019', 'p1000000-0000-0000-0000-000000000007', '500g', 500, 420, 35),
  ('v1000000-0000-0000-0000-000000000020', 'p1000000-0000-0000-0000-000000000007', '1kg', 1000, 800, 25),
  -- Moong Dal Halwa
  ('v1000000-0000-0000-0000-000000000021', 'p1000000-0000-0000-0000-000000000008', '250g', 250, 280, 35),
  ('v1000000-0000-0000-0000-000000000022', 'p1000000-0000-0000-0000-000000000008', '500g', 500, 520, 30),
  -- Sooji Halwa
  ('v1000000-0000-0000-0000-000000000023', 'p1000000-0000-0000-0000-000000000009', '250g', 250, 150, 50),
  ('v1000000-0000-0000-0000-000000000024', 'p1000000-0000-0000-0000-000000000009', '500g', 500, 280, 40),
  -- Anjeer Roll
  ('v1000000-0000-0000-0000-000000000025', 'p1000000-0000-0000-0000-000000000010', '250g', 250, 320, 40),
  ('v1000000-0000-0000-0000-000000000026', 'p1000000-0000-0000-0000-000000000010', '500g', 500, 600, 30),
  -- Kaju Pista Roll
  ('v1000000-0000-0000-0000-000000000027', 'p1000000-0000-0000-0000-000000000011', '250g', 250, 380, 40),
  ('v1000000-0000-0000-0000-000000000028', 'p1000000-0000-0000-0000-000000000011', '500g', 500, 720, 30),
  -- Royal Assorted Box
  ('v1000000-0000-0000-0000-000000000029', 'p1000000-0000-0000-0000-000000000012', '500g Box', 500, 550, 30),
  ('v1000000-0000-0000-0000-000000000030', 'p1000000-0000-0000-0000-000000000012', '1kg Box', 1000, 1000, 25),
  ('v1000000-0000-0000-0000-000000000031', 'p1000000-0000-0000-0000-000000000012', '2kg Premium Box', 2000, 1900, 15);

-- Product Ingredients mapping
INSERT INTO public.product_ingredients (product_id, ingredient_id) VALUES
  -- Kaju Barfi: Cashews, Sugar, Ghee, Cardamom, Silver Leaf
  ('p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000005'),
  ('p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000007'),
  ('p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000013'),
  -- Pista Barfi: Pistachios, Sugar, Ghee, Cardamom, Milk
  ('p1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000006'),
  ('p1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000007'),
  ('p1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000001'),
  -- Badam Barfi: Almonds, Sugar, Ghee, Cardamom, Milk, Saffron
  ('p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000007'),
  ('p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000008'),
  -- Motichoor Ladoo: Besan, Sugar, Ghee, Saffron, Cardamom, Rose Water
  ('p1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000009'),
  ('p1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000008'),
  ('p1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000007'),
  ('p1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000012'),
  -- Besan Ladoo: Besan, Sugar, Ghee, Cardamom, Almonds
  ('p1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000009'),
  ('p1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000007'),
  ('p1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000004'),
  -- Coconut Ladoo: Coconut, Sugar, Milk, Cardamom
  ('p1000000-0000-0000-0000-000000000006', 'i1000000-0000-0000-0000-000000000011'),
  ('p1000000-0000-0000-0000-000000000006', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000006', 'i1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000006', 'i1000000-0000-0000-0000-000000000007'),
  -- Gajar Ka Halwa: Milk, Sugar, Ghee, Cardamom, Almonds, Cashews
  ('p1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000007'),
  ('p1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000005'),
  -- Moong Dal Halwa: Ghee, Sugar, Milk, Almonds, Cardamom
  ('p1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000007'),
  -- Sooji Halwa: Semolina, Sugar, Ghee, Saffron, Cardamom
  ('p1000000-0000-0000-0000-000000000009', 'i1000000-0000-0000-0000-000000000016'),
  ('p1000000-0000-0000-0000-000000000009', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000009', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000009', 'i1000000-0000-0000-0000-000000000008'),
  ('p1000000-0000-0000-0000-000000000009', 'i1000000-0000-0000-0000-000000000007'),
  -- Anjeer Roll: Dates, Cashews, Almonds, Coconut, Cardamom
  ('p1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000015'),
  ('p1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000005'),
  ('p1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000011'),
  ('p1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000007'),
  -- Kaju Pista Roll: Cashews, Pistachios, Sugar, Ghee, Cardamom
  ('p1000000-0000-0000-0000-000000000011', 'i1000000-0000-0000-0000-000000000005'),
  ('p1000000-0000-0000-0000-000000000011', 'i1000000-0000-0000-0000-000000000006'),
  ('p1000000-0000-0000-0000-000000000011', 'i1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000011', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000011', 'i1000000-0000-0000-0000-000000000007'),
  -- Royal Assorted Box: multiple
  ('p1000000-0000-0000-0000-000000000012', 'i1000000-0000-0000-0000-000000000005'),
  ('p1000000-0000-0000-0000-000000000012', 'i1000000-0000-0000-0000-000000000006'),
  ('p1000000-0000-0000-0000-000000000012', 'i1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000012', 'i1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000012', 'i1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000012', 'i1000000-0000-0000-0000-000000000002');

-- Catering Events
INSERT INTO public.catering_events (id, title, description, image_url, event_type) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Grand Wedding Reception', 'Full-service wedding catering for 500+ guests with live counters, dessert stations, and a royal dining experience.', null, 'wedding'),
  ('e1000000-0000-0000-0000-000000000002', 'Corporate Annual Gala', 'Elegant multi-course dining for corporate events with curated menus and professional service staff.', null, 'corporate'),
  ('e1000000-0000-0000-0000-000000000003', 'Birthday & Anniversary Celebrations', 'Customized menus and themed setups for milestone celebrations, from intimate gatherings to grand parties.', null, 'birthday'),
  ('e1000000-0000-0000-0000-000000000004', 'Festival & Puja Catering', 'Traditional sweets and savory spreads for Diwali, Navratri, Ganesh Chaturthi, and other festive occasions.', null, 'festival'),
  ('e1000000-0000-0000-0000-000000000005', 'Engagement & Sangeet', 'Vibrant menus with chaat counters, live pasta stations, and curated cocktail pairings for pre-wedding events.', null, 'wedding');

-- Catering Menu Items
INSERT INTO public.catering_menu_items (id, name, category, service_time, price_per_person, description, is_available) VALUES
  -- Breakfast items
  ('m1000000-0000-0000-0000-000000000001', 'Poha Station', 'Light Bites', 'breakfast', 40, 'Fresh poha with sev, lemon, and coriander', true),
  ('m1000000-0000-0000-0000-000000000002', 'Idli Sambar', 'South Indian', 'breakfast', 50, 'Steamed idlis with sambar and chutneys', true),
  ('m1000000-0000-0000-0000-000000000003', 'Puri Bhaji', 'North Indian', 'breakfast', 55, 'Hot puris with aloo bhaji', true),
  ('m1000000-0000-0000-0000-000000000004', 'Paratha Counter', 'North Indian', 'breakfast', 60, 'Assorted stuffed parathas with curd and pickle', true),
  ('m1000000-0000-0000-0000-000000000005', 'Fresh Juice Station', 'Beverages', 'breakfast', 35, 'Orange, watermelon, and seasonal fruit juices', true),
  ('m1000000-0000-0000-0000-000000000006', 'Tea & Coffee Station', 'Beverages', 'breakfast', 25, 'Masala chai, filter coffee, and green tea', true),
  -- Lunch items
  ('m1000000-0000-0000-0000-000000000007', 'Dal Tadka', 'Main Course', 'lunch', 30, 'Yellow dal tempered with cumin and ghee', true),
  ('m1000000-0000-0000-0000-000000000008', 'Paneer Butter Masala', 'Main Course', 'lunch', 55, 'Creamy paneer in tomato-butter gravy', true),
  ('m1000000-0000-0000-0000-000000000009', 'Jeera Rice', 'Rice', 'lunch', 25, 'Basmati rice tempered with cumin seeds', true),
  ('m1000000-0000-0000-0000-000000000010', 'Naan & Roti', 'Breads', 'lunch', 20, 'Assorted Indian breads from tandoor', true),
  ('m1000000-0000-0000-0000-000000000011', 'Mix Veg Curry', 'Main Course', 'lunch', 35, 'Seasonal vegetables in aromatic gravy', true),
  ('m1000000-0000-0000-0000-000000000012', 'Raita & Papad', 'Sides', 'lunch', 15, 'Boondi raita and roasted papad', true),
  ('m1000000-0000-0000-0000-000000000013', 'Gulab Jamun', 'Dessert', 'lunch', 25, 'Soft milk dumplings in rose-scented syrup', true),
  ('m1000000-0000-0000-0000-000000000014', 'Biryani', 'Rice', 'lunch', 70, 'Fragrant dum biryani with raita', true),
  -- Snacks items
  ('m1000000-0000-0000-0000-000000000015', 'Samosa Station', 'Chaat', 'snacks', 30, 'Crispy samosas with green and tamarind chutney', true),
  ('m1000000-0000-0000-0000-000000000016', 'Pani Puri Counter', 'Chaat', 'snacks', 35, 'Live pani puri counter with multiple flavored waters', true),
  ('m1000000-0000-0000-0000-000000000017', 'Bhel Puri', 'Chaat', 'snacks', 25, 'Puffed rice tossed with chutneys and vegetables', true),
  ('m1000000-0000-0000-0000-000000000018', 'Sandwich & Wrap Station', 'Western', 'snacks', 40, 'Grilled sandwiches and wraps with dips', true),
  ('m1000000-0000-0000-0000-000000000019', 'Pakora Platter', 'Fried', 'snacks', 30, 'Assorted vegetable pakoras with chutneys', true),
  ('m1000000-0000-0000-0000-000000000020', 'Masala Chai', 'Beverages', 'snacks', 15, 'Piping hot masala tea', true),
  -- Dinner items
  ('m1000000-0000-0000-0000-000000000021', 'Shahi Paneer', 'Main Course', 'dinner', 60, 'Royal paneer dish with rich cream and nuts', true),
  ('m1000000-0000-0000-0000-000000000022', 'Dal Makhani', 'Main Course', 'dinner', 45, 'Slow-cooked black dal with butter and cream', true),
  ('m1000000-0000-0000-0000-000000000023', 'Veg Pulao', 'Rice', 'dinner', 30, 'Fragrant vegetable pulao with saffron', true),
  ('m1000000-0000-0000-0000-000000000024', 'Assorted Breads', 'Breads', 'dinner', 25, 'Naan, kulcha, and laccha paratha from live tandoor', true),
  ('m1000000-0000-0000-0000-000000000025', 'Malai Kofta', 'Main Course', 'dinner', 55, 'Cottage cheese dumplings in creamy gravy', true),
  ('m1000000-0000-0000-0000-000000000026', 'Ice Cream Counter', 'Dessert', 'dinner', 35, 'Multiple flavors with toppings', true),
  ('m1000000-0000-0000-0000-000000000027', 'Jalebi with Rabri', 'Dessert', 'dinner', 30, 'Hot jalebis served with thick rabri', true),
  -- Late Night items
  ('m1000000-0000-0000-0000-000000000028', 'Pasta Station', 'Live Counter', 'late_night', 45, 'Live pasta counter with custom sauces', true),
  ('m1000000-0000-0000-0000-000000000029', 'Soup Station', 'Beverages', 'late_night', 30, 'Hot soups - tomato, sweet corn, and manchow', true),
  ('m1000000-0000-0000-0000-000000000030', 'Kulfi Counter', 'Dessert', 'late_night', 25, 'Traditional Indian ice cream in multiple flavors', true),
  ('m1000000-0000-0000-0000-000000000031', 'Chai & Coffee', 'Beverages', 'late_night', 20, 'Late night chai and coffee station', true),
  ('m1000000-0000-0000-0000-000000000032', 'Maggi Station', 'Live Counter', 'late_night', 30, 'Live maggi counter with toppings', true);

-- Catering Add-ons
INSERT INTO public.catering_addons (id, name, addon_type, price, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Basic Counter Setup', 'counter', 5000, 'Standard serving counters with clean linen and basic decoration'),
  ('a1000000-0000-0000-0000-000000000002', 'Premium Counter Setup', 'counter', 12000, 'Elegant counters with flowers, chafing dishes, and themed decoration'),
  ('a1000000-0000-0000-0000-000000000003', 'Royal Counter Setup', 'counter', 25000, 'Luxury setup with designer counters, live stations, and floral arrangements'),
  ('a1000000-0000-0000-0000-000000000004', 'Service Waiter', 'service_staff', 1500, 'Professional waiter for table service (per waiter per day)'),
  ('a1000000-0000-0000-0000-000000000005', 'Head Chef On-site', 'service_staff', 5000, 'Experienced head chef managing food preparation on location'),
  ('a1000000-0000-0000-0000-000000000006', 'Beverage Manager', 'service_staff', 2500, 'Dedicated staff for managing drinks and beverage counters'),
  ('a1000000-0000-0000-0000-000000000007', 'Floral Table Centerpieces', 'decoration', 500, 'Fresh flower arrangements for each guest table'),
  ('a1000000-0000-0000-0000-000000000008', 'LED Lighting Setup', 'decoration', 8000, 'Ambient LED lighting for dining area'),
  ('a1000000-0000-0000-0000-000000000009', 'Disposable Crockery (Premium)', 'crockery', 15, 'Eco-friendly premium disposable plates and cutlery (per person)'),
  ('a1000000-0000-0000-0000-000000000010', 'Steel Crockery', 'crockery', 30, 'Stainless steel plates, bowls, and cutlery (per person)'),
  ('a1000000-0000-0000-0000-000000000011', 'Bone China Crockery', 'crockery', 60, 'Premium bone china dinner set with glassware (per person)');
