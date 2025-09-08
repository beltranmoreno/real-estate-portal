# Test Data Generation Scripts

This directory contains scripts to generate and import test property data for the real estate portal.

## Scripts Overview

### 1. `generate-test-properties.js`
Generates realistic test property data with:
- 50+ diverse properties across different types (villa, apartment, condo, etc.)
- Multiple themes (luxury, beachfront, golf, family, etc.)
- Realistic pricing, amenities, and location data
- Images from Unsplash collections
- Bilingual content (English/Spanish)
- 7 different areas in Dominican Republic

### 2. `import-to-sanity.js`
Imports the generated test data into your Sanity dataset:
- Creates area documents first (required for property references)
- Imports property documents
- Optional image upload from Unsplash URLs
- Batch processing to avoid API rate limits

## Quick Start

### Step 1: Generate Test Data
```bash
npm run generate-test-data
```

This will create:
- `scripts/test-data/properties.json` - 50+ property documents
- `scripts/test-data/areas.json` - 7 area documents  
- `scripts/test-data/summary.json` - Generation summary

### Step 2: Import to Sanity
First, you'll need a Sanity write token:

1. Go to https://sanity.io/manage
2. Select your project
3. Go to API → Tokens
4. Create a new token with "Editor" permissions
5. Copy the token

Then set environment variables:
```bash
export SANITY_API_WRITE_TOKEN="your_write_token_here"
# Make sure these are also set:
export NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
export NEXT_PUBLIC_SANITY_DATASET="development"
```

Now import the data:
```bash
npm run import-test-data
```

## Generated Data Features

### Property Types
- **Villa**: Luxury oceanfront and beachside villas
- **Apartment**: Modern seaside and city apartments
- **Condo**: Resort-style and luxury condos
- **Townhouse**: Contemporary and beachside townhouses
- **Penthouse**: Sky-high luxury penthouses
- **Studio**: Cozy beach and designer studios
- **House**: Tropical and modern family houses

### Themes
- **Luxury**: High-end amenities and premium finishes
- **Beachfront**: Direct beach access and ocean views
- **Golf**: Golf cart access and course proximity
- **Family**: Kid-friendly amenities and large spaces
- **Romantic**: Intimate settings and special features
- **Business**: Work-friendly amenities and conference facilities
- **Adventure**: Activity-focused locations and equipment
- **Wellness**: Spa-like amenities and peaceful settings

### Locations
- **Casa de Campo** (La Romana)
- **Punta Cana** (La Altagracia)
- **La Romana** (La Romana)
- **Bavaro** (La Altagracia)
- **Cap Cana** (La Altagracia)
- **Playa Dorada** (Puerto Plata)
- **Ocean World** (Puerto Plata)

### Pricing
- **Rental**: $150-$2,500 per night
- **Sale**: $200K-$5M
- **Mixed**: Both rental and sale options

### Images
- Uses Unsplash Source API for realistic property photos
- Curated collections for each property type and theme
- Main image + 5-15 gallery images per property
- Automatic image URLs with proper dimensions

## Data Structure

Each property includes:
- Basic info (titles, descriptions, codes)
- Location with coordinates and nearby attractions
- Comprehensive amenities (50+ features)
- Pricing for rental and/or sale
- Availability and booking rules
- House rules and contact info
- SEO metadata
- Image gallery

## Customization

### Modify Property Count
Edit the `numberOfProperties` variable in `generate-test-properties.js`:
```javascript
const numberOfProperties = 100 // Generate 100 properties
```

### Add Custom Areas
Add to the `areas` array:
```javascript
const areas = [
  { name: 'Your Area', slug: 'your-area', region: 'Your Region' },
  // ... existing areas
]
```

### Customize Image Collections
Update `unsplashCollections` with your preferred Unsplash collection IDs:
```javascript
const unsplashCollections = {
  villa: ['your-collection-id'],
  luxury: ['another-collection-id']
}
```

## Troubleshooting

### Import Issues
- **Authentication Error**: Make sure `SANITY_API_WRITE_TOKEN` is set
- **Rate Limiting**: The script includes delays, but you can increase them
- **Image Upload Failures**: Images will use placeholder references if upload fails

### Generated Data Issues
- **Missing Images**: Check Unsplash collection IDs are valid
- **Validation Errors**: Ensure your Sanity schemas match the generated structure

### Performance
- **Large Datasets**: For 100+ properties, consider processing in smaller batches
- **Image Processing**: Uncomment image upload code in import script for actual Unsplash images

## Notes

- Images use Unsplash Source URLs which load dynamically
- Property codes are randomly generated (format: AB1234)
- Coordinates are approximate Dominican Republic locations
- All monetary values are in USD
- Generated data includes realistic but fictional contact information

## Next Steps

After importing:
1. Visit your Sanity Studio to review the data
2. Test the search functionality on your frontend
3. Create collections using the imported properties
4. Customize property details as needed
5. Add actual images through Sanity Studio if desired

The generated data provides a comprehensive foundation for testing all aspects of your real estate portal!