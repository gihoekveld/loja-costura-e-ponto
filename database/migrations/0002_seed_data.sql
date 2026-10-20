-- Migration 0002: Seed Data para Costura & Ponto (Ateliê e Oficina Doméstica)

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM sessions;
DELETE FROM products;
DELETE FROM users;

-- Inserir Usuários Seed (PBKDF2-HMAC-SHA256 100k iter, Hash Determinístico de CPF e AES-256-GCM)
-- Mariana Silva (Cliente): Senha 'Costura2026!' | CPF '234.567.890-12'
-- Administrador: Senha 'AdminCostura2026!' | CPF '111.222.333-44'
INSERT INTO users (
    id, name, email, password_hash, cpf_hash, cpf_encrypted,
    phone, cep, street, number, complement, neighborhood, city, state, role
) VALUES 
(
    'usr_mariana_001',
    'Mariana Silva - Ateliê Ponto de Ouro',
    'mariana@ateliecostura.com.br',
    'pbkdf2:100000:939f4d85cdeb4c9b89b4f599b57e7192:7cc5e9fe976bfc9ff41b73c0380cc0c456f9cf794d0d9167978236ec23d3999f',
    'ca278634f144070c95e7451118b32e4ba7ecb39df2ddbdebfe54f4b044a08375',
    'aes-gcm:760bd6832dfc69de62138602:0f6d1531c727d061158053c088f8bb5039d52686ef02d18e2534b7',
    '(11) 98765-4321',
    '04012-000',
    'Rua das Flores',
    '250',
    'Apto 42',
    'Vila Mariana',
    'São Paulo',
    'SP',
    'customer'
),
(
    'usr_admin_001',
    'Administrador Costura & Ponto',
    'admin@costuraeponto.com.br',
    'pbkdf2:100000:36a2ac6365216b3d9546549462703896:c0c3532194a3efea025ad4dda47e309a0f0f280158a08f808d240d1dee9df2c9',
    '6efc9bc78754ba00c73eba235cf8b3002115449e01913748fc0af17dcc8f8ab3',
    'aes-gcm:ef55a4e9c2c9b006377990c0:5e343c54c853b00731d34d12e40336d8a386849344328542b58877',
    '(11) 3222-1000',
    '03104-002',
    'Rua da Mooca',
    '1540',
    'Galpão Ateliê',
    'Mooca',
    'São Paulo',
    'SP',
    'admin'
);

-- Inserir 15 Produtos Realistas de Costura e Oficinas Domésticas
INSERT INTO products (id, name, description, price, stock, category, image_url) VALUES 
('prod_01', 'Aparelho de Viés Dobra Dupla Industrial (Regulável)', 'Aparelho em aço inox para aplicação rápida e precisa de viés de 35mm com acabamento dobrado de 10mm. Compatível com máquinas retas industriais e máquinas domésticas com suporte adaptador.', 68.90, 24, 'Aparelhos & Guias', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421443/sec-store/aparelho-vies-2-dobras-maquina-reta-industrial-domestica.webp'),
('prod_02', 'Guia Magnético de Costura Imã Extra Forte G30', 'Guia de borda com imã de neodímio para fixação na chapa de ponto da máquina. Garante costuras retas milimétricas, pespontos alinhados e barras perfeitamente retas sem folga.', 24.50, 60, 'Aparelhos & Guias', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421513/sec-store/aparelho-guia-magnetico-de-barra-para-maquina-costura-ima.webp'),
('prod_03', 'Kit 12 Cones Linha de Costura 100% Poliéster 40/2 (5.000 Jardas)', 'Linhas lubrificadas de alta resistência e torção perfeita que não arrebentam em alta velocidade. Kit com 10 cones em cores essenciais (Preto, Branco, Cru, Marinho, Grafite e tons neutros) para oficinas e ateliês.', 129.90, 18, 'Linhas & Fios', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421610/sec-store/kit-12-linhas-coloridas-costura-geral-120-reta.webp'),
('prod_04', 'Fio de Overloque Texturizado 100g 100% Poliamida (Kit 4 Cones)', 'Fio elástico e suave de excelente cobertura para looper de máquinas overloque e interloque. Proporciona acabamento macio e flexível para moda íntima, moda praia, fitness e malharia em geral.', 54.90, 35, 'Linhas & Fios', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421711/sec-store/fios-de-overloque-linha-4-unidades-preto-overlock.webp'),
('prod_05', 'Linha para Pesponto Pesado nº 36 Bonderizada (Cone 1.500m)', 'Linha encorpada de alta tenacidade para pespontos decorativos e costuras de alta carga em jeans, sarjas grossas, lonas, couro sintético e mochilas.', 32.00, 28, 'Linhas & Fios', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421822/sec-store/linha-de-poliester-pesponto-tit-36.webp'),
('prod_06', 'Calcador de Teflon Antiaderente para Couro e Sintéticos', 'Sapatilha especial com base em teflon virgem (PTFE). Desliza perfeitamente sobre couro ecológico, plástico cristal, vinil e sintéticos sem enrugar ou grudar.', 28.50, 42, 'Calcadores & Sapatilhas', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421875/sec-store/calcador-teflon-roller-foot-maquina-industrial-couro-vinil.webp'),
('prod_07', 'Calcador para Zíper Invisível em Aço Temperado', 'Calcador com ranhuras inferiores paralelas que desenrolam os dentes espirais do zíper, possibilitando costura rente que deixa o zíper 100% imperceptível na peça final.', 34.00, 30, 'Calcadores & Sapatilhas', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421937/sec-store/calcador-para-ziper-invisivel-de-aco.webp'),
('prod_08', 'Aparelho Franzidor com Regulagem Micrométrica', 'Aparelho com parafuso regulador de densidade de franzimento. Permite criar babados, pregas e franzidos com simetria milimétrica em vestidos, cortinas e almofadas.', 48.00, 15, 'Aparelhos & Guias', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427556/sec-store/calcador-franzidor-ajustavel-reta-industrial-p5q.webp'),
('prod_09', 'Base de Corte Auto-regenerativa A2 (60x45cm) Dupla Face', 'Base de corte profissional em PVC multicamadas com tecnologia de autocura das ranhuras. Grade métrica com medidas em cm e marcações de ângulos para patchwork e modelagem.', 79.90, 22, 'Corte & Medição', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792429440/placa-base-de-corte-tapete-apoio-a4.webp'),
('prod_10', 'Cortador Rotativo Ergonômico 45mm com Trava de Segurança', 'Lâmina circular em aço tungstênio de longa durabilidade. Corta com leveza até 6 camadas de tecido sem mastigar ou repuxar fios. Trava retrátil de proteção.', 46.50, 40, 'Corte & Medição', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427798/sec-store/cortador-circular-de-tecido-papel-45mm-profissional.webp'),
('prod_11', 'Tesoura de Alfaiate Profissional 10" Aço Carbono Forjado', 'Tesoura balanceada pesada com corte preciso de ponta a ponta. Afiação duradoura, parafuso de ajuste de pressão em latão e formato ideal para apoio em mesa de corte.', 95.00, 16, 'Corte & Medição', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427660/sec-store/tesoura-forjada-10-pol-alfaiate-costura-profissional-tecidos-cor-prateado.webp'),
('prod_12', 'Kit 25 Bobinas de Alumínio Baixa com Estojo Acrílico', 'Bobinas balanceadas de precisão que evitam trepidação da caixa de bobina e falhas de ponto. Acompanha estojo organizador transparente com travas.', 38.00, 50, 'Agulhas & Bobinas', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427911/sec-store/stojo-porta-bobinas-reta-industrial-25-bobinas-aluminio.webp'),
('prod_13', 'Kit 50 Agulhas Schmetz Ponta Bola para Malhas (70/10 a 100/16)', 'Agulhas de alta precisão com ponta arredondada que desliza entre os fios da malha em vez de perfurá-los, eliminando furos indesejados em tecidos com elastano.', 89.90, 26, 'Agulhas & Bobinas', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427984/sec-store/kit-50-agulhas-singer-2020-maquina-caseira-agulha-domestica.webp'),
('prod_14', 'Calcador de Bainha Enrolada / Lenço 3mm e 6mm (Kit 2x)', 'Dobra e costura bainhas finas e delicadas automaticamente em uma única passagem. Perfeito para tecidos finos, lenços de seda, vestidos de festa e guardanapos.', 36.90, 32, 'Calcadores & Sapatilhas', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792428048/sec-store/kit-3-sapatas-calcador-sapatilha-bainha-enrolada-3mm-4mm-6mm.webp'),
('prod_15', 'Aparelho Tensor Guia Passador de Elástico Regulável', 'Aparelho em metal galvanizado para pregar elásticos de 5mm a 25mm com regulagem contínua de tensão para aplicação em moda íntima e elásticos embutidos.', 52.00, 20, 'Aparelhos & Guias', 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792428134/sec-store/aparelho-tensor-elastico-overlock-galoneira-c-suporte.webp'),
('prod_16', 'Botão de Resina 11mm Sortido (Pote com 50 unidades)', 'Botões resistentes de 2 e 4 furos em cores vibrantes e acabamento polido. Ideal para camisas, artesanato e confecção infantil.', 19.90, 45, 'Botões', '/images/cat_botoes.jpg'),
('prod_17', 'Zíper Invisível 20cm Poliéster (Kit 10 unidades)', 'Zíperes finos de fechamento suave e dentes protegidos. Acabamento imperceptível em vestidos, saias e almofadas.', 26.50, 38, 'Zíperes', '/images/cat_ziperes.jpg'),
('prod_18', 'Elástico Chato 10mm Reforçado (Rolo com 50 metros)', 'Elástico de alta elasticidade e memória mecânica. Não esgarça após lavagens frequentes. Ideal para máscaras, lingeries e cós.', 29.90, 40, 'Elásticos & Viés', '/images/cat_elasticos.jpg'),
('prod_19', 'Fita Métrica de Costura 1,50m Flexível com Trava', 'Fita dupla face em fibra de vidro com marcações milimétricas em centímetros e polegadas. Não estica com o tempo de uso.', 14.90, 65, 'Acessórios', '/images/cat_acessorios.jpg');

-- Inserir Pedido Realista
INSERT INTO orders (id, user_id, total, status, shipping_address, payment_method) VALUES 
('ord_mariana_01', 'usr_mariana_001', 123.80, 'paid', 'Rua das Flores, 250 - Apto 42 - Vila Mariana, São Paulo/SP - CEP 04012-000 (Destinatário: Mariana Silva, CPF: 234.567.890-12)', 'pix');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES 
('item_01', 'ord_mariana_01', 'prod_01', 1, 68.90),
('item_02', 'ord_mariana_01', 'prod_04', 1, 54.90);
