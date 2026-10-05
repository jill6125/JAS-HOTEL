"""Database seed script with authentic luxury hotel dining menu and suites."""

import logging
from datetime import datetime, timezone
from pymongo import ASCENDING
from app.config import Config
from app.constants import CURRENCY_INR
from app.db.client import close_db, init_db
from app.db.indexes import create_indexes

logger = logging.getLogger(__name__)

# Menu Seed Data (Breakfast, Starters, Main Courses, Sides, Desserts, Beverages)
SEED_MENU_ITEMS = [
    # 1. Breakfast (4 items)
    {
        "name": "Royal Saffron Appam & Ishtew",
        "description": "Crisp lace-rimmed fermented rice appams, coconut milk vegetable stew infused with green cardamom, cold-pressed Kerala coconut oil, and tempered curry leaves.",
        "category": "Breakfast",
        "price": 750,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 1,
        "calories": 420,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 20,
    },
    {
        "name": "Truffle Ghee Roast Dosa",
        "description": "Crisp golden crepe basted with artisanal A2 Gir cow ghee, wild Himalayan morels, spiced gunpowder podi, served with trio of coastal chutneys and sambar.",
        "category": "Breakfast",
        "price": 850,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 2,
        "calories": 490,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 15,
    },
    {
        "name": "Malabar Parotta & Duck Egg Roast",
        "description": "Flaky hand-tossed layered Malabar parotta, slow-braised caramelized onion and roasted duck eggs with crushed Tellicherry black peppercorns.",
        "category": "Breakfast",
        "price": 780,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 3,
        "calories": 540,
        "dietary": ["Pescatarian"],
        "preparation_time_minutes": 18,
    },
    {
        "name": "Banarasi Bedmi Poori & Aloo Subzi",
        "description": "Crispy puffed urad dal pooris, heirloom potato curry slow-cooked with fenugreek and amchur, served with ginger sonth chutney and pickled green chilies.",
        "category": "Breakfast",
        "price": 680,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 4,
        "calories": 520,
        "dietary": ["Vegetarian"],
        "preparation_time_minutes": 15,
    },

    # 2. Starters (4 items)
    {
        "name": "Kakori Galawat Kebab",
        "description": "Melt-in-mouth smoked young lamb pate infused with 32 royal spices, rose petal extract, and saffron, set atop saffron sheermal crisps.",
        "category": "Starters",
        "price": 1250,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 5,
        "calories": 480,
        "dietary": ["Halal"],
        "preparation_time_minutes": 25,
    },
    {
        "name": "Bhatti Da Murgh Tikka",
        "description": "Charred chicken supremes steeped in crushed coriander, kachri, malt vinegar, degi mirch, and yellow mustard oil, flash-roasted in clay tandoor.",
        "category": "Starters",
        "price": 950,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 6,
        "calories": 410,
        "dietary": ["Halal", "Gluten-Free"],
        "preparation_time_minutes": 20,
    },
    {
        "name": "Kasundi Mustard Jheenga",
        "description": "Jumbo Arabian Sea tiger prawns marinated with fermented Bengal Kasundi mustard, turmeric leaf, and carom seeds, chargrilled over charcoal.",
        "category": "Starters",
        "price": 1450,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 7,
        "calories": 360,
        "dietary": ["Pescatarian", "Gluten-Free"],
        "preparation_time_minutes": 22,
    },
    {
        "name": "Dahi Ke Kebab & Fig Chutney",
        "description": "Velvety hung curd patties with green cardamom, roasted pine nuts, and mint, pan-seared in ghee, served with dried Afghani fig relish.",
        "category": "Starters",
        "price": 780,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 8,
        "calories": 390,
        "dietary": ["Vegetarian"],
        "preparation_time_minutes": 15,
    },

    # 3. Main Courses (5 items)
    {
        "name": "Dum Pukht Awadhi Gosht Biryani",
        "description": "Sealed pastry handi with fragrant aged Dehradun basmati rice, tender baby goat shanks, saffron essence, kewra water, and caramelized onions.",
        "category": "Main Courses",
        "price": 1650,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 9,
        "calories": 780,
        "dietary": ["Halal"],
        "preparation_time_minutes": 35,
    },
    {
        "name": "Dal JAS 1947 (Signature)",
        "description": "Black urad lentils simmered for 48 hours over charcoal embers with San Marzano style vine tomatoes, white makhan, and house-churned cream.",
        "category": "Main Courses",
        "price": 950,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 10,
        "calories": 480,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 20,
    },
    {
        "name": "Old Delhi Butter Chicken Grand Cru",
        "description": "Clay-oven smoked bone-in chicken thighs tossed in silk-strained makhani gravy enriched with roasted kasoori methi and clover honey.",
        "category": "Main Courses",
        "price": 1350,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 11,
        "calories": 650,
        "dietary": ["Halal", "Gluten-Free"],
        "preparation_time_minutes": 25,
    },
    {
        "name": "Alleppey Seabass Curry",
        "description": "Fresh wild-caught Arabian Seabass simmered in raw green mango curry, spiced coconut cream, shallots, and freshly plucked Malabar curry leaves.",
        "category": "Main Courses",
        "price": 1550,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 12,
        "calories": 510,
        "dietary": ["Pescatarian", "Gluten-Free"],
        "preparation_time_minutes": 25,
    },
    {
        "name": "Paneer Lababdar & Pine Nuts",
        "description": "Artisanal buffalo milk cottage cheese batons folded in chunky onion-tomato reduction with roasted pine nuts and mace aroma.",
        "category": "Main Courses",
        "price": 1050,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 13,
        "calories": 560,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 20,
    },

    # 4. Sides (3 items)
    {
        "name": "Burani Garlic Raita",
        "description": "Velvety whipped full-cream curd folded with golden fried garlic chips, roasted cumin powder, and Kashmiri chili dusting.",
        "category": "Sides",
        "price": 320,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 14,
        "calories": 180,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 10,
    },
    {
        "name": "Truffle & Garlic Chur Chur Naan",
        "description": "Multi-layered flaky tandoor bread brushed with white truffle oil, roasted garlic slivers, and crushed coriander seeds.",
        "category": "Sides",
        "price": 380,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 15,
        "calories": 290,
        "dietary": ["Vegetarian"],
        "preparation_time_minutes": 10,
    },
    {
        "name": "Aged Jeera Basmati Pulao",
        "description": "Extra-long grain Dehradun basmati rice tempered with Himalayan caraway seeds, whole cloves, and brown butter.",
        "category": "Sides",
        "price": 350,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 16,
        "calories": 310,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 12,
    },

    # 5. Desserts (4 items)
    {
        "name": "24K Gold Leaf Shahi Tukda",
        "description": "Ghee-crisped brioche steeped in saffron rabri, edible 24K gold foil, slivered Mamra almonds, and Iranian pistachios.",
        "category": "Desserts",
        "price": 850,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 17,
        "calories": 520,
        "dietary": ["Vegetarian"],
        "preparation_time_minutes": 15,
    },
    {
        "name": "Alphonso Mango Kulfi Pop",
        "description": "Slow-reduced carmelized milk kulfi infused with Ratnagiri Alphonso mango pulp, green cardamom, and candied rose petals.",
        "category": "Desserts",
        "price": 490,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 18,
        "calories": 340,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 10,
    },
    {
        "name": "Nolen Gur & Cardamom Cheesecake",
        "description": "Baked artisanal chhena cheesecake sweetened with seasonal date palm jaggery, spiked with nutmeg on a pistachio sablé crust.",
        "category": "Desserts",
        "price": 650,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 19,
        "calories": 440,
        "dietary": ["Vegetarian"],
        "preparation_time_minutes": 12,
    },
    {
        "name": "Paan & Rose Petal Sorbet",
        "description": "Chilled palate cleanser prepared with fresh betel leaf, rose petal gulkand, fennel seed infusion, and cold-pressed lime.",
        "category": "Desserts",
        "price": 420,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 20,
        "calories": 160,
        "dietary": ["Vegan", "Gluten-Free"],
        "preparation_time_minutes": 8,
    },

    # 6. Beverages (5 items)
    {
        "name": "Kashmiri Saffron & Almond Kahwa",
        "description": "Green tea leaves slow-brewed in samovar with saffron strands, cinnamon bark, green cardamom, and crushed sweet almonds.",
        "category": "Beverages",
        "price": 380,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=85",
        "featured": True,
        "available": True,
        "sort_order": 21,
        "calories": 90,
        "dietary": ["Vegan", "Gluten-Free"],
        "preparation_time_minutes": 10,
    },
    {
        "name": "Royal Cardamom Masala Chai",
        "description": "Estate single-origin Assam CTC tea steeped with green cardamom, ginger, buffalo milk, and unrefined khandsari jaggery.",
        "category": "Beverages",
        "price": 280,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 22,
        "calories": 140,
        "dietary": ["Vegetarian"],
        "preparation_time_minutes": 8,
    },
    {
        "name": "Marine Drive Tender Coconut Elixir",
        "description": "Fresh tender coconut water, cold-pressed lime, crushed sweet basil, and mineral-rich Himalayan rock salt.",
        "category": "Beverages",
        "price": 340,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 23,
        "calories": 75,
        "dietary": ["Vegan", "Gluten-Free"],
        "preparation_time_minutes": 5,
    },
    {
        "name": "Artisanal Mango Mint Lassi",
        "description": "Slow-churned Greek-style yogurt blended with Alphonso pulp, fresh spearmint leaves, and crushed pistachio dusting.",
        "category": "Beverages",
        "price": 360,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 24,
        "calories": 210,
        "dietary": ["Vegetarian", "Gluten-Free"],
        "preparation_time_minutes": 8,
    },
    {
        "name": "The Kokum & Cumin Highball",
        "description": "Smoked Malabar kokum extract, roasted cumin, sparkling mineral tonic, Himalayan rock salt, fresh mint, and lime twist.",
        "category": "Beverages",
        "price": 420,
        "currency": CURRENCY_INR,
        "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=85",
        "featured": False,
        "available": True,
        "sort_order": 25,
        "calories": 110,
        "dietary": ["Vegan", "Gluten-Free"],
        "preparation_time_minutes": 5,
    },
]

# Luxury Suites Seed Data
SEED_ROOMS = [
    {
        "room_slug": "room-1",
        "name": "The Maharaja Presidential Suite",
        "category": "Maharaja Presidential Suite",
        "tagline": "The Pinnacle of Regal Hospitality on Marine Drive",
        "description": "An imperial 2,800 sq ft residence perched on the highest sanctuary floor with uninterrupted 360° panoramas of the Arabian Sea and the glittering Queen's Necklace. Features a private heated plunge pool on the sunset terrace, hand-carved teak royal four-poster king bed, Italian Portoro marble soaking tub, private dining salon for eight, and 24-hour dedicated royal butler service.",
        "price_per_night": 75000,
        "currency": CURRENCY_INR,
        "size_sqft": 2800,
        "max_adults": 4,
        "max_children": 2,
        "bed_type": "Grand Imperial Teak King Bed",
        "view": "Unobstructed Arabian Sea & Queen's Necklace",
        "amenities": [
            "24/7 Dedicated Butler Service",
            "Private Heated Plunge Pool & Terrace",
            "In-Suite Champagne Breakfast Included",
            "Airport Limousine Rolls-Royce Transfer",
            "Italian Marble Steam & Soaking Tub",
            "Bang & Olufsen Sound Acoustics",
        ],
        "images": [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85",
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85",
        ],
        "available": True,
        "featured": True,
    },
    {
        "room_slug": "room-2",
        "name": "Royal Marine Bay Suite",
        "category": "Royal Pavilion",
        "tagline": "Opulent Coastal Grandeur with Private Sunset Deck",
        "description": "1,400 sq ft of bespoke coastal luxury overlooking the serene waves of Marine Drive. Outfitted with Belgian linen bedding, hand-knotted Kashmiri silk carpets, a private balcony sun deck for intimate evening dining, walk-in dressing parlor, and an expansive spa bathroom with freestanding soaking tub.",
        "price_per_night": 42000,
        "currency": CURRENCY_INR,
        "size_sqft": 1400,
        "max_adults": 3,
        "max_children": 2,
        "bed_type": "Royal Pillowtop King Bed",
        "view": "Panoramic Marine Drive & Arabian Sea Bay",
        "amenities": [
            "Private Sunset Balcony with Daybed",
            "Complimentary High Tea at The Salon",
            "Deep Soaking Freestanding Tub",
            "Nespresso Artisanal Coffee Bar",
            "Luxury Ayurvedic Bath Amenities",
            "High-Speed Symmetrical Wi-Fi",
        ],
        "images": [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85",
        ],
        "available": True,
        "featured": True,
    },
    {
        "room_slug": "room-3",
        "name": "Executive Heritage Suite",
        "category": "Executive Bay Suite",
        "tagline": "Refined Sanctuary for the Discerning Traveler",
        "description": "Spanning 950 sq ft, this suite harmonizes historic Indian royal architecture with contemporary elegance. Offers a tranquil courtyard fountain view, dedicated mahogany writing desk, separate living lounge, plush featherbed, and rain-dance shower chamber.",
        "price_per_night": 26500,
        "currency": CURRENCY_INR,
        "size_sqft": 950,
        "max_adults": 2,
        "max_children": 1,
        "bed_type": "Signature Cloud King Bed",
        "view": "Palace Courtyard & Lotus Fountain",
        "amenities": [
            "Separate Living Lounge & Salon",
            "Mahogany Executive Study Desk",
            "Rainfall Shower with Forest Essence",
            "Smart Climate & Ambient Lighting Control",
            "Curated Mini-Bar with Indian Craft Spirits",
        ],
        "images": [
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=85",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
        ],
        "available": True,
        "featured": True,
    },
    {
        "room_slug": "room-4",
        "name": "Deluxe Heritage Chamber",
        "category": "Deluxe Heritage",
        "tagline": "Timeless Warmth & Intimate Boutique Luxury",
        "description": "An exquisitely appointed 650 sq ft chamber adorned with custom brass finishes, warm ivory lime-plastered walls, plush seating alcove, luxury Egyptian cotton linens, and double-glazed soundproof glass providing a quiet oasis in the heart of Mumbai.",
        "price_per_night": 16500,
        "currency": CURRENCY_INR,
        "size_sqft": 650,
        "max_adults": 2,
        "max_children": 1,
        "bed_type": "King or Twin Heritage Beds",
        "view": "Nariman Point Skyline & Heritage Gardens",
        "amenities": [
            "Plush Seating Bay Window Alcove",
            "Marble Vanity with Dual Basins",
            "Pillow Selection Concierge Menu",
            "Twice-Daily Housekeeping Service",
            "Curated Reading Library",
        ],
        "images": [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=85",
        ],
        "available": True,
        "featured": False,
    },
]


def seed_database(uri: str | None = None, db_name: str | None = None) -> None:
    """Idempotently seed the MongoDB database with initial menu items, rooms, and indexes."""
    uri = uri or Config.MONGODB_URI
    db_name = db_name or Config.MONGODB_DB

    print(f"Connecting to MongoDB at {uri} (Database: {db_name})...")
    db = init_db(uri=uri, db_name=db_name)

    # 1. Create indexes first
    create_indexes(db)

    # 2. Seed Menu Items idempotently (upsert based on item name)
    now = datetime.now(timezone.utc)
    seeded_menu_count = 0
    for item in SEED_MENU_ITEMS:
        item_copy = dict(item)
        item_name = item_copy.pop("name")
        item_copy["updated_at"] = now

        db.menu_items.update_one(
            {"name": item_name},
            {
                "$set": item_copy,
                "$setOnInsert": {
                    "name": item_name,
                    "created_at": now,
                },
            },
            upsert=True,
        )
        seeded_menu_count += 1

    print(f"Successfully seeded/updated {seeded_menu_count} hotel dining menu items.")

    # 3. Seed Luxury Rooms idempotently (upsert based on room_slug or name)
    seeded_room_count = 0
    for room in SEED_ROOMS:
        room_copy = dict(room)
        slug = room_copy.pop("room_slug")
        room_name = room_copy.pop("name")
        room_copy["updated_at"] = now

        db.rooms.update_one(
            {"room_slug": slug},
            {
                "$set": room_copy,
                "$setOnInsert": {
                    "room_slug": slug,
                    "name": room_name,
                    "created_at": now,
                },
            },
            upsert=True,
        )
        seeded_room_count += 1

    print(f"Successfully seeded/updated {seeded_room_count} luxury suites and chambers.")
    print("Database seeding completed successfully.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    try:
        seed_database()
    finally:
        close_db()
