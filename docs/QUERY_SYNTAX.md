# Query Syntax Guide

This guide explains how to write natural language queries for the NLP Image Processor. The system uses Google Gemini AI to understand your requests and convert them into structured image processing specifications.

## Overview

Simply describe what you want in plain English. The system is designed to understand various phrasings and automatically extract relevant parameters.

**Example**:
```
"convert this to a passport photo 300 ppi"
```

This will be parsed into:
```json
{
  "task_type": "passport_photo",
  "dimensions": { "width_mm": 35, "height_mm": 45 },
  "dpi": 300,
  "background": "white",
  "format": "jpg"
}
```

---

## Task Types

The system recognizes several types of image processing tasks:

### 1. Passport Photos

**Keywords**: `passport`, `passport photo`, `passport-size`

**Standard Passport** (35mm x 45mm):
```
"convert to passport photo"
"make this a passport-size photo"
"passport photo 300 dpi"
```

**US Passport** (51mm x 51mm / 2x2 inches):
```
"US passport photo"
"2x2 inch passport photo"
"American passport photo 300 ppi"
```

**Automatic Defaults**:
- Dimensions: 35x45mm (standard) or 51x51mm (US)
- DPI: 300
- Background: White
- Format: JPG
- Face requirements: All enabled (shoulders visible, ears visible, centered face, no tilt)

**Custom Overrides**:
```
"passport photo with blue background"
"US passport photo 600 dpi"
"passport photo in PNG format"
```

---

### 2. Resize

**Keywords**: `resize`, `scale`, `dimensions`, `size`

**Pixel Dimensions**:
```
"resize to 1280x720"
"scale to 1920 x 1080 pixels"
"make it 800x600"
```

**Millimeter Dimensions**:
```
"resize to 35mm x 45mm"
"scale to 100 x 150 millimeters"
```

**Inch Dimensions** (automatically converted to mm):
```
"resize to 4x6 inches"
"make it 2 x 2 inch"
"scale to 5x7 in"
```

**Supported Formats**:
- `WIDTHxHEIGHT` (e.g., `1280x720`)
- `WIDTH x HEIGHT` (with space)
- `WIDTH by HEIGHT`
- Units: `px`, `pixels`, `mm`, `millimeters`, `in`, `inch`, `inches`

---

### 3. Compression

**Keywords**: `compress`, `reduce size`, `file size`, `smaller`

**With Specific Size**:
```
"compress to under 1MB"
"reduce file size to 500KB"
"make it smaller than 2MB"
```

**Without Specific Size** (defaults to 1MB):
```
"compress this image"
"reduce file size"
"make it smaller"
```

**Supported Units**:
- `KB`, `kilobytes`
- `MB`, `megabytes`

---

### 4. Background Change

**Keywords**: `background`, `remove background`, `transparent`

**White Background**:
```
"white background"
"change background to white"
"add white background"
```

**Blue Background**:
```
"blue background"
"change background to blue"
```

**Transparent Background**:
```
"remove background"
"transparent background"
"no background"
"cut out background"
```

**Keep Original**:
```
"keep original background"
"don't change background"
```

---

### 5. Format Conversion

**Keywords**: `convert`, `save as`, `format`, `change to`

**JPEG/JPG**:
```
"convert to JPG"
"save as JPEG"
"change format to jpg"
```

**PNG**:
```
"convert to PNG"
"save as png"
"make it a PNG file"
```

**WebP**:
```
"convert to WebP"
"save as webp"
```

**Note**: The system normalizes `jpeg` and `jpg` to the same format.

---

### 6. DPI/PPI Settings

**Keywords**: `dpi`, `ppi`, `resolution`, `dots per inch`, `pixels per inch`

**Examples**:
```
"300 dpi"
"set resolution to 600 ppi"
"make it 150 dots per inch"
"high resolution 600 dpi"
```

**Common Values**:
- 72 dpi: Screen display
- 150 dpi: Draft printing
- 300 dpi: Standard printing (default for passport photos)
- 600 dpi: High-quality printing

---

## Combining Multiple Requirements

You can combine multiple requirements in a single query:

**Examples**:
```
"resize to 1280x720, compress to 500KB, and convert to PNG"

"passport photo with blue background at 600 dpi"

"remove background, resize to 800x600, and save as WebP"

"convert to US passport photo format, 300 ppi, white background"

"compress to under 1MB and convert to JPG"
```

---

## Ambiguous or Incomplete Queries

When the system cannot determine specific parameters, it will:
- Set `task_type` to `"custom"`
- Populate only the fields it can confidently determine
- Set undetermined fields to `null`

**Example**:
```
Query: "make it look better"

Result:
{
  "task_type": "custom",
  "dimensions": { "width_mm": null, "height_mm": null, "width_px": null, "height_px": null },
  "dpi": null,
  "background": null,
  "face_requirements": null,
  "max_file_size_mb": null,
  "format": null,
  "additional_notes": "enhance image quality"
}
```

---

## Tips for Best Results

### 1. Be Specific
✅ Good: `"resize to 1280x720 pixels"`
❌ Vague: `"make it bigger"`

### 2. Use Standard Terms
✅ Good: `"passport photo"`, `"compress"`, `"resize"`
❌ Unclear: `"make it official"`, `"shrink it"`

### 3. Include Units
✅ Good: `"resize to 35mm x 45mm"`
✅ Good: `"resize to 1280x720 pixels"`
❌ Ambiguous: `"resize to 35x45"` (could be pixels or mm)

### 4. Specify Exact Values
✅ Good: `"compress to 500KB"`
✅ Good: `"300 dpi"`
❌ Vague: `"high resolution"`, `"small file size"`

### 5. Use Natural Language
The system understands various phrasings:
- `"convert to"` = `"change to"` = `"make it"` = `"save as"`
- `"resize"` = `"scale"` = `"change size"`
- `"compress"` = `"reduce size"` = `"make smaller"`

---

## Example Queries by Use Case

### Professional Documents
```
"passport photo 300 dpi white background"
"US passport photo 600 ppi"
"resize to 35mm x 45mm, white background, JPG format"
```

### Web Images
```
"resize to 1920x1080, compress to 500KB, convert to WebP"
"scale to 800x600 pixels and compress to under 200KB"
"remove background and save as PNG"
```

### Social Media
```
"resize to 1080x1080 for Instagram"
"compress to under 1MB for Facebook"
"resize to 1200x630 for Twitter card"
```

### Printing
```
"resize to 4x6 inches at 300 dpi"
"convert to 8x10 inches, 600 dpi, JPG format"
"resize to 100mm x 150mm at 300 dpi"
```

### E-commerce
```
"resize to 2000x2000, white background, compress to 1MB"
"remove background, resize to 1500x1500, save as PNG"
"compress to 500KB, convert to WebP"
```

---

## Supported Units Reference

### Dimensions
- **Pixels**: `px`, `pixels`, `pixel`
- **Millimeters**: `mm`, `millimeters`, `millimeter`
- **Inches**: `in`, `inch`, `inches`, `"` (1 inch = 25.4mm)

### File Size
- **Kilobytes**: `KB`, `kb`, `kilobytes`
- **Megabytes**: `MB`, `mb`, `megabytes`

### Resolution
- **DPI**: `dpi`, `dots per inch`
- **PPI**: `ppi`, `pixels per inch`

---

## Common Patterns

### Pattern 1: Task + Dimension
```
"resize to 1280x720"
"passport photo"
"compress to 500KB"
```

### Pattern 2: Task + Dimension + Quality
```
"resize to 1920x1080 at 300 dpi"
"passport photo 600 ppi"
"compress to 1MB high quality"
```

### Pattern 3: Task + Dimension + Format
```
"resize to 800x600 and convert to PNG"
"passport photo in JPG format"
"compress to 500KB as WebP"
```

### Pattern 4: Multiple Tasks
```
"resize to 1280x720, compress to 500KB, and convert to WebP"
"remove background, resize to 800x600, save as PNG"
"passport photo with blue background at 600 dpi"
```

---

## Validation Rules

The system validates your queries and will return errors for:

1. **Empty Queries**: Query must contain at least some text
2. **Malicious Content**: Queries with suspicious patterns are rejected
3. **Invalid JSON**: When using the API directly, ensure proper JSON formatting

---

## Output Format

All queries are converted to this JSON structure:

```json
{
  "task_type": "passport_photo | resize | compress | background_change | enhance | format_change | custom",
  "dimensions": {
    "width_mm": number | null,
    "height_mm": number | null,
    "width_px": number | null,
    "height_px": number | null
  },
  "dpi": number | null,
  "background": "white | blue | transparent | original" | null,
  "face_requirements": {
    "shoulders_visible": boolean | null,
    "ears_visible": boolean | null,
    "centered_face": boolean | null,
    "no_tilt": boolean | null
  } | null,
  "max_file_size_mb": number | null,
  "format": "jpg | png | webp" | null,
  "additional_notes": string | null
}
```

---

## Troubleshooting

### Query Not Parsing Correctly?

1. **Be more specific**: Add units and exact values
2. **Use standard terms**: Stick to common image processing terminology
3. **Check spelling**: Ensure keywords are spelled correctly
4. **Simplify**: Break complex queries into simpler parts

### Getting "custom" Task Type?

This means the system couldn't determine a specific task. Try:
- Using more specific keywords (`passport photo`, `resize`, `compress`)
- Including exact dimensions or values
- Referencing the examples in this guide

### Dimensions Not Recognized?

- Always include units: `1280x720 pixels` or `35x45mm`
- Use standard formats: `WIDTHxHEIGHT` or `WIDTH x HEIGHT`
- Check for typos in unit names

---

## Need Help?

- Review the [API Documentation](./API.md) for technical details
- Check the [Testing Guide](./TESTING.md) for testing queries
- See example queries throughout this guide
- Try the application's built-in example queries

---

## Quick Reference

| What You Want | Example Query |
|---------------|---------------|
| Standard passport photo | `"passport photo"` |
| US passport photo | `"US passport photo"` |
| Resize to pixels | `"resize to 1280x720"` |
| Resize to mm | `"resize to 35mm x 45mm"` |
| Resize to inches | `"resize to 4x6 inches"` |
| Compress | `"compress to 500KB"` |
| White background | `"white background"` |
| Remove background | `"remove background"` |
| Convert to PNG | `"convert to PNG"` |
| Set DPI | `"300 dpi"` |
| Multiple operations | `"resize to 1280x720, compress to 500KB, convert to PNG"` |
