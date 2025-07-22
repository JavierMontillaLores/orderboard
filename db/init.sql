CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_avatar VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    order_type VARCHAR(50) DEFAULT 'Standard',
    items INT DEFAULT 0,
    tags TEXT[],
    due_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_notes TEXT,
    action_json JSONB
);

CREATE TABLE IF NOT EXISTS order_items (
    item_id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT,
    quantity INT,
    price NUMERIC(10,2),
    discount NUMERIC(4,2),
    total NUMERIC(12,2)
);

-- Insert sample customer data
INSERT INTO customers (customer_name, customer_avatar) VALUES 
('Canva', 'CA'),
('Zazzle', 'ZA'),
('Etsy', 'ET'),
('Minted', 'MI')
ON CONFLICT DO NOTHING;

-- Insert 100 sample orders with random data
INSERT INTO orders (order_id, customer_id, status, order_type, items, tags, due_date, last_updated, action_notes, action_json) VALUES 

('1000', 1, 'Pending', 'standard', 245, ARRAY['urgent', 'logo'], '2025-07-15', NOW() - INTERVAL '5 minutes', 'Waiting for artwork approval','{}'),
('1001', 2, 'Print Ready', 'ad-hoc', 1408, ARRAY['big', 'logo', '+3'], '2025-05-05', NOW() - INTERVAL '10 minutes', 'Ready for production', '{}'),
('1002', 3, 'Printed', 'standard', 67, ARRAY['small', 'text'], '2025-06-20', NOW() - INTERVAL '2 minutes', 'Quality check passed', '{}'),
('1003', 4, 'Shipped', 'ad-hoc', 892, ARRAY['color', 'premium'], '2025-04-30', NOW() - INTERVAL '45 minutes', 'Tracking: TR123456789', '{"shipped": "2025-05-15T14:00:00"}'),
('1004', 1, 'Print Ready', 'standard', 156, ARRAY['monochrome', 'simple'], '2025-07-01', NOW() - INTERVAL '8 minutes', 'Print queue assigned', '{}'),
('1005', 2, 'Pending', 'ad-hoc', 2341, ARRAY['complex', 'multi-color'], '2025-08-10', NOW() - INTERVAL '15 minutes', 'Customer revision needed', '{}'),
('1006', 3, 'Shipped', 'standard', 89, ARRAY['mini', 'bulk'], '2025-05-15', NOW() - INTERVAL '120 minutes', 'Delivered successfully', '{}'),
('1007', 4, 'Printed', 'ad-hoc', 445, ARRAY['vintage', 'textured'], '2025-06-05', NOW() - INTERVAL '30 minutes', 'Finishing touches applied', '{}'),
('1008', 1, 'Print Ready', 'standard', 778, ARRAY['glossy', 'photo'], '2025-07-20', NOW() - INTERVAL '3 minutes', 'High priority order', '{}'),
('1009', 2, 'Pending', 'ad-hoc', 134, ARRAY['matte', 'business'], '2025-09-01', NOW() - INTERVAL '25 minutes', 'Payment confirmation pending', '{}'),
('1010', 3, 'Shipped', 'standard', 567, ARRAY['large', 'banner'], '2025-04-25', NOW() - INTERVAL '90 minutes', 'Express delivery', '{}'),
('1011', 4, 'Print Ready', 'ad-hoc', 223, ARRAY['custom', 'die-cut'], '2025-06-30', NOW() - INTERVAL '12 minutes', 'Special paper requested', '{}'),
('1012', 1, 'Printed', 'standard', 1089, ARRAY['eco-friendly', 'recycled'], '2025-07-08', NOW() - INTERVAL '18 minutes', 'Green printing complete', '{}'),
('1013', 2, 'Pending', 'ad-hoc', 345, ARRAY['holographic', 'special'], '2025-08-20', NOW() - INTERVAL '7 minutes', 'Material sourcing in progress', '{}'),
('1014', 3, 'Shipped', 'standard', 678, ARRAY['waterproof', 'outdoor'], '2025-05-10', NOW() - INTERVAL '60 minutes', 'Weather-resistant coating', '{}'),
('1015', 4, 'Print Ready', 'ad-hoc', 912, ARRAY['embossed', 'luxury'], '2025-06-15', NOW() - INTERVAL '22 minutes', 'Premium finish ready', '{}'),
('1016', 1, 'Printed', 'standard', 156, ARRAY['transparent', 'clear'], '2025-07-25', NOW() - INTERVAL '35 minutes', 'Clear substrate used', '{}'),
('1017', 2, 'Pending', 'ad-hoc', 789, ARRAY['metallic', 'gold'], '2025-09-05', NOW() - INTERVAL '14 minutes', 'Gold foil application pending', '{}'),
('1018', 3, 'Shipped', 'standard', 234, ARRAY['magnetic', 'functional'], '2025-04-20', NOW() - INTERVAL '75 minutes', 'Magnetic backing applied', '{}'),
('1019', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['glow-in-dark', 'novelty'], '2025-06-25', NOW() - INTERVAL '9 minutes', 'Special ink loaded', '{}'),
('1020', 1, 'Printed', 'standard', 823, ARRAY['double-sided', 'flip'], '2025-07-12', NOW() - INTERVAL '28 minutes', 'Both sides printed', '{}'),
('1021', 2, 'Pending', 'ad-hoc', 445, ARRAY['perforated', 'tearable'], '2025-08-15', NOW() - INTERVAL '16 minutes', 'Perforation setup required', '{}'),
('1022', 3, 'Shipped', 'standard', 678, ARRAY['laminated', 'durable'], '2025-05-01', NOW() - INTERVAL '105 minutes', 'Lamination complete', '{"shipped": "2025-05-13T12:00:00"}'),
('1023', 4, 'Print Ready', 'ad-hoc', 189, ARRAY['mini', 'pocket'], '2025-06-18', NOW() - INTERVAL '11 minutes', 'Small format ready', '{}'),
('1024', 1, 'Printed', 'standard', 1234, ARRAY['poster', 'wall'], '2025-07-30', NOW() - INTERVAL '33 minutes', 'Large format complete', '{}'),
('1025', 2, 'Pending', 'ad-hoc', 567, ARRAY['fabric', 'textile'], '2025-09-10', NOW() - INTERVAL '19 minutes', 'Fabric printing queue', '{}'),
('1026', 3, 'Shipped', 'standard', 345, ARRAY['canvas', 'art'], '2025-04-15', NOW() - INTERVAL '85 minutes', 'Canvas stretched', '{}'),
('1027', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['vinyl', 'sticker'], '2025-06-28', NOW() - INTERVAL '6 minutes', 'Vinyl cut ready', '{}'),
('1028', 1, 'Printed', 'standard', 456, ARRAY['cardboard', 'packaging'], '2025-07-18', NOW() - INTERVAL '24 minutes', 'Corrugated material', '{"printed": "2025-05-22T14:00:00"}'),
('1029', 2, 'Pending', 'ad-hoc', 678, ARRAY['foil', 'silver'], '2025-08-25', NOW() - INTERVAL '13 minutes', 'Silver foil order', '{}'),
('1030', 3, 'Shipped', 'standard', 234, ARRAY['booklet', 'multi-page'], '2025-05-05', NOW() - INTERVAL '95 minutes', 'Saddle stitched', '{"shipped": "2025-05-22T09:00:00"}'),
('1031', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['spiral', 'bound'], '2025-06-22', NOW() - INTERVAL '17 minutes', 'Spiral binding ready', '{}'),
('1032', 1, 'Printed', 'standard', 890, ARRAY['hardcover', 'book'], '2025-07-05', NOW() - INTERVAL '41 minutes', 'Case binding done', '{}'),
('1033', 2, 'Pending', 'ad-hoc', 123, ARRAY['pop-up', '3d'], '2025-09-15', NOW() - INTERVAL '21 minutes', '3D design review', '{}'),
('1034', 3, 'Shipped', 'standard', 456, ARRAY['envelope', 'mailing'], '2025-04-28', NOW() - INTERVAL '70 minutes', 'Bulk mailing ready', '{}'),
('1035', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['ticket', 'event'], '2025-06-12', NOW() - INTERVAL '8 minutes', 'Event tickets queued', '{}'),
('1036', 1, 'Printed', 'standard', 345, ARRAY['certificate', 'award'], '2025-07-22', NOW() - INTERVAL '32 minutes', 'Award certificates', '{"printed": "2025-05-15T14:00:00"}'),
('1037', 2, 'Pending', 'ad-hoc', 678, ARRAY['menu', 'restaurant'], '2025-08-30', NOW() - INTERVAL '15 minutes', 'Menu design review', '{}'),
('1038', 3, 'Shipped', 'standard', 234, ARRAY['brochure', 'tri-fold'], '2025-05-08', NOW() - INTERVAL '88 minutes', 'Folding complete', '{}'),
('1039', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['postcard', 'mailing'], '2025-06-08', NOW() - INTERVAL '26 minutes', 'Postcard format ready', '{}'),
('1040', 1, 'Printed', 'standard', 890, ARRAY['calendar', 'wall'], '2025-07-15', NOW() - INTERVAL '37 minutes', 'Wall calendar bound', '{}'),
('1041', 2, 'Pending', 'ad-hoc', 123, ARRAY['stationery', 'letterhead'], '2025-09-20', NOW() - INTERVAL '12 minutes', 'Letterhead approval', '{}'),
('1042', 3, 'Shipped', 'standard', 456, ARRAY['label', 'product'], '2025-04-22', NOW() - INTERVAL '78 minutes', 'Product labels shipped', '{}'),
('1043', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['banner', 'outdoor'], '2025-06-16', NOW() - INTERVAL '4 minutes', 'Weather-resistant banner', '{}'),
('1044', 1, 'Printed', 'standard', 345, ARRAY['flyer', 'promotional'], '2025-07-28', NOW() - INTERVAL '29 minutes', 'Promotional flyers done', '{}'),
('1045', 2, 'Pending', 'ad-hoc', 678, ARRAY['packaging', 'box'], '2025-09-02', NOW() - INTERVAL '20 minutes', 'Custom box design', '{}'),
('1046', 3, 'Shipped', 'standard', 234, ARRAY['card', 'greeting'], '2025-05-12', NOW() - INTERVAL '92 minutes', 'Greeting cards shipped', '{}'),
('1047', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['tag', 'hang'], '2025-06-26', NOW() - INTERVAL '14 minutes', 'Hang tags ready', '{}'),
('1048', 1, 'Printed', 'standard', 890, ARRAY['notebook', 'ruled'], '2025-07-10', NOW() - INTERVAL '36 minutes', 'Ruled notebooks complete', '{}'),
('1049', 2, 'Pending', 'ad-hoc', 123, ARRAY['magnet', 'refrigerator'], '2025-08-18', NOW() - INTERVAL '23 minutes', 'Magnet backing order', '{}'),
('1050', 3, 'Shipped', 'standard', 456, ARRAY['coaster', 'drink'], '2025-04-18', NOW() - INTERVAL '82 minutes', 'Drink coasters shipped', '{}'),
('1051', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['mousepad', 'office'], '2025-06-20', NOW() - INTERVAL '7 minutes', 'Office mousepads ready', '{}'),
('1052', 1, 'Printed', 'standard', 345, ARRAY['placemat', 'table'], '2025-07-24', NOW() - INTERVAL '31 minutes', 'Table placemats done', '{}'),
('1053', 2, 'Pending', 'ad-hoc', 678, ARRAY['keychain', 'promotional'], '2025-09-08', NOW() - INTERVAL '18 minutes', 'Keychain production', '{}'),
('1054', 3, 'Shipped', 'standard', 234, ARRAY['badge', 'id'], '2025-05-03', NOW() - INTERVAL '96 minutes', 'ID badges shipped', '{}'),
('1055', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['folder', 'presentation'], '2025-06-14', NOW() - INTERVAL '10 minutes', 'Presentation folders', '{}'),
('1056', 1, 'Printed', 'standard', 890, ARRAY['invoice', 'carbon'], '2025-07-19', NOW() - INTERVAL '38 minutes', 'Carbon copy invoices', '{}'),
('1057', 2, 'Pending', 'ad-hoc', 123, ARRAY['receipt', 'thermal'], '2025-08-28', NOW() - INTERVAL '25 minutes', 'Thermal receipt paper', '{}'),
('1058', 3, 'Shipped', 'standard', 456, ARRAY['wristband', 'event'], '2025-04-26', NOW() - INTERVAL '73 minutes', 'Event wristbands', '{}'),
('1059', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['backdrop', 'photo'], '2025-06-10', NOW() - INTERVAL '5 minutes', 'Photo backdrop ready', '{}'),
('1060', 1, 'Printed', 'standard', 345, ARRAY['tablecloth', 'event'], '2025-07-26', NOW() - INTERVAL '34 minutes', 'Event tablecloths', '{}'),
('1061', 2, 'Pending', 'ad-hoc', 678, ARRAY['window', 'decal'], '2025-09-12', NOW() - INTERVAL '22 minutes', 'Window decal design', '{}'),
('1062', 3, 'Shipped', 'standard', 234, ARRAY['floor', 'graphic'], '2025-05-06', NOW() - INTERVAL '89 minutes', 'Floor graphics shipped', '{}'),
('1063', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['car', 'wrap'], '2025-06-24', NOW() - INTERVAL '16 minutes', 'Vehicle wrap material', '{}'),
('1064', 1, 'Printed', 'standard', 890, ARRAY['awning', 'shade'], '2025-07-14', NOW() - INTERVAL '39 minutes', 'Awning fabric printed', '{}'),
('1065', 2, 'Pending', 'ad-hoc', 123, ARRAY['tent', 'popup'], '2025-08-22', NOW() - INTERVAL '27 minutes', 'Pop-up tent graphics', '{}'),
('1066', 3, 'Shipped', 'standard', 456, ARRAY['flag', 'outdoor'], '2025-04-24', NOW() - INTERVAL '76 minutes', 'Outdoor flags shipped', '{}'),
('1067', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['sign', 'yard'], '2025-06-18', NOW() - INTERVAL '9 minutes', 'Yard signs ready', '{}'),
('1068', 1, 'Printed', 'standard', 345, ARRAY['board', 'foam'], '2025-07-21', NOW() - INTERVAL '42 minutes', 'Foam board mounting', '{}'),
('1069', 2, 'Pending', 'ad-hoc', 678, ARRAY['panel', 'aluminum'], '2025-09-06', NOW() - INTERVAL '30 minutes', 'Aluminum panel order', '{}'),
('1070', 3, 'Shipped', 'standard', 234, ARRAY['acrylic', 'clear'], '2025-05-09', NOW() - INTERVAL '84 minutes', 'Clear acrylic panels', '{}'),
('1071', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['metal', 'steel'], '2025-06-27', NOW() - INTERVAL '13 minutes', 'Steel plate printing', '{}'),
('1072', 1, 'Printed', 'standard', 890, ARRAY['wood', 'natural'], '2025-07-17', NOW() - INTERVAL '44 minutes', 'Wood grain printing', '{}'),
('1073', 2, 'Pending', 'ad-hoc', 123, ARRAY['ceramic', 'tile'], '2025-08-26', NOW() - INTERVAL '28 minutes', 'Ceramic tile graphics', '{}'),
('1074', 3, 'Shipped', 'standard', 456, ARRAY['glass', 'frosted'], '2025-04-21', NOW() - INTERVAL '79 minutes', 'Frosted glass etching', '{}'),
('1075', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['plastic', 'durable'], '2025-06-13', NOW() - INTERVAL '6 minutes', 'Durable plastic signs', '{}'),
('1076', 1, 'Printed', 'standard', 345, ARRAY['rubber', 'flexible'], '2025-07-23', NOW() - INTERVAL '35 minutes', 'Flexible rubber mats', '{}'),
('1077', 2, 'Pending', 'ad-hoc', 678, ARRAY['leather', 'premium'], '2025-09-04', NOW() - INTERVAL '24 minutes', 'Premium leather goods', '{}'),
('1078', 3, 'Shipped', 'standard', 234, ARRAY['cork', 'natural'], '2025-05-07', NOW() - INTERVAL '87 minutes', 'Natural cork products', '{}'),
('1079', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['bamboo', 'eco'], '2025-06-21', NOW() - INTERVAL '11 minutes', 'Eco bamboo materials', '{}'),
('1080', 1, 'Printed', 'standard', 890, ARRAY['cotton', 'organic'], '2025-07-27', NOW() - INTERVAL '40 minutes', 'Organic cotton fabric', '{}'),
('1081', 2, 'Pending', 'ad-hoc', 123, ARRAY['silk', 'luxury'], '2025-08-24', NOW() - INTERVAL '26 minutes', 'Luxury silk printing', '{}'),
('1082', 3, 'Shipped', 'standard', 456, ARRAY['linen', 'textured'], '2025-04-19', NOW() - INTERVAL '81 minutes', 'Textured linen fabric', '{}'),
('1083', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['denim', 'casual'], '2025-06-17', NOW() - INTERVAL '8 minutes', 'Casual denim printing', '{}'),
('1084', 1, 'Printed', 'standard', 345, ARRAY['polyester', 'durable'], '2025-07-29', NOW() - INTERVAL '43 minutes', 'Durable polyester', '{}'),
('1085', 2, 'Pending', 'ad-hoc', 678, ARRAY['nylon', 'strong'], '2025-09-11', NOW() - INTERVAL '29 minutes', 'Strong nylon material', '{}'),
('1086', 3, 'Shipped', 'standard', 234, ARRAY['spandex', 'stretch'], '2025-05-02', NOW() - INTERVAL '93 minutes', 'Stretch spandex fabric', '{}'),
('1087', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['wool', 'warm'], '2025-06-11', NOW() - INTERVAL '15 minutes', 'Warm wool material', '{}'),
('1088', 1, 'Printed', 'standard', 890, ARRAY['fleece', 'soft'], '2025-07-13', NOW() - INTERVAL '46 minutes', 'Soft fleece fabric', '{}'),
('1089', 2, 'Pending', 'ad-hoc', 123, ARRAY['velvet', 'plush'], '2025-08-21', NOW() - INTERVAL '31 minutes', 'Plush velvet material', '{}'),
('1090', 3, 'Shipped', 'standard', 456, ARRAY['satin', 'smooth'], '2025-04-27', NOW() - INTERVAL '77 minutes', 'Smooth satin finish', '{}'),
('1091', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['twill', 'weave'], '2025-06-19', NOW() - INTERVAL '12 minutes', 'Twill weave fabric', '{}'),
('1092', 1, 'Printed', 'standard', 345, ARRAY['canvas', 'heavy'], '2025-07-31', NOW() - INTERVAL '47 minutes', 'Heavy canvas material', '{}'),
('1093', 2, 'Pending', 'ad-hoc', 678, ARRAY['mesh', 'breathable'], '2025-09-03', NOW() - INTERVAL '33 minutes', 'Breathable mesh fabric', '{}'),
('1094', 3, 'Shipped', 'standard', 234, ARRAY['taffeta', 'crisp'], '2025-05-04', NOW() - INTERVAL '91 minutes', 'Crisp taffeta fabric', '{}'),
('1095', 4, 'Print Ready', 'ad-hoc', 567, ARRAY['chiffon', 'light'], '2025-06-15', NOW() - INTERVAL '17 minutes', 'Light chiffon material', '{}'),
('1096', 1, 'Printed', 'standard', 890, ARRAY['organza', 'sheer'], '2025-07-16', NOW() - INTERVAL '48 minutes', 'Sheer organza fabric', '{}'),
('1097', 2, 'Pending', 'ad-hoc', 123, ARRAY['tulle', 'delicate'], '2025-08-19', NOW() - INTERVAL '34 minutes', 'Delicate tulle material', '{}'),
('1098', 3, 'Shipped', 'standard', 456, ARRAY['lace', 'intricate'], '2025-04-23', NOW() - INTERVAL '86 minutes', 'Intricate lace pattern', '{}'),
('1099', 4, 'Print Ready', 'ad-hoc', 789, ARRAY['brocade', 'ornate'], '2025-06-23', NOW() - INTERVAL '19 minutes', 'Ornate brocade design', '{}'),
('1100', 1, 'Printed', 'standard', 345, ARRAY['damask', 'elegant'], '2025-07-25', NOW() - INTERVAL '50 minutes', 'Elegant damask finish', '{}')
ON CONFLICT (order_id) DO NOTHING;

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update last_updated
CREATE TRIGGER update_orders_last_updated 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_last_updated_column();