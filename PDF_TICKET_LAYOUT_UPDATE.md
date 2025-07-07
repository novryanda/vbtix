# PDF Ticket Layout Update - Professional Clean Design

## Perubahan yang Dilakukan (Berdasarkan Referensi PDF)

### 1. Header Section - Clean & Professional
- **Background**: Light blue background dengan border biru
- **Logo VBTicket**: Logo di pojok kiri atas (ukuran 20mm) 
- **Judul**: "E-Ticket VBTicket" di sebelah logo
- **Event Title**: Judul event di kanan atas (dengan text wrapping jika terlalu panjang)
- **Layout**: Menggunakan box dengan background dan border seperti referensi

### 2. Content Section - Two Column Layout
#### Left Column: Informasi Tiket
- **Background**: Light gray dengan border subtle
- **Content**: 
  - Nomor Tiket
  - Jenis Tiket  
  - Pemegang Tiket
  - Invoice
- **Format**: Label dengan font kecil, value dengan font lebih besar

#### Right Column: Detail Acara
- **Background**: Light gray dengan border subtle
- **Content**:
  - Tanggal (terpisah dari waktu)
  - Waktu
  - Lokasi
  - Alamat (dengan truncation jika terlalu panjang)

### 3. QR Code Section - Centered & Clean
- **Background**: White background dengan border biru
- **Ukuran QR**: 30mm (lebih kecil dan profesional seperti referensi)
- **Posisi**: Center dengan spacing yang tepat
- **Instruksi**: Text sederhana di bawah QR code

### 4. Instructions Section - Numbered List
- **Background**: Very light gray dengan border
- **Format**: Numbered list (1, 2, 3) bukan bullet points
- **Content**: Instruksi yang lebih concise dan professional

### 5. Footer Section - Professional Bar
- **Background**: Light gray background dengan border
- **Layout**: Horizontal bar dengan informasi tersebar
- **Left**: Logo Wondr + "Support by wondr"  
- **Right**: Email contact "VBTicket@gmail.com"

## Struktur Layout Baru (Seperti Referensi PDF)

```
┌─────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────┐ │
│ │ [VB Logo] E-Ticket VBTicket    Event Title  │ │ ← Header Box
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────┐ ┌─────────────────────────┐ │
│ │ INFORMASI TIKET │ │ DETAIL ACARA            │ │ ← Two Columns
│ │ Nomor Tiket:    │ │ Tanggal:                │ │
│ │ [Value]         │ │ [Value]                 │ │
│ │ Jenis Tiket:    │ │ Waktu:                  │ │
│ │ [Value]         │ │ [Value]                 │ │
│ │ Pemegang:       │ │ Lokasi:                 │ │
│ │ [Value]         │ │ [Value]                 │ │
│ │ Invoice:        │ │ Alamat:                 │ │
│ │ [Value]         │ │ [Value]                 │ │
│ └─────────────────┘ └─────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │            KODE QR TIKET                    │ │ ← QR Section
│ │              [QR 30mm]                      │ │
│ │        Tunjukkan QR code ini...             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ PETUNJUK PENTING                            │ │ ← Instructions
│ │ 1. Bawa identitas yang sesuai...            │ │
│ │ 2. Datang 30 menit sebelum...               │ │
│ │ 3. Simpan tiket ini dengan baik...          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Wondr] Support by wondr    VBTicket@gmai...│ │ ← Footer Bar
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Improvements dari Layout Sebelumnya

### Design Improvements:
1. **Sectioned Layout**: Setiap bagian memiliki background dan border terpisah
2. **Two-Column Content**: Informasi tiket dan detail acara side-by-side
3. **Smaller QR Code**: 30mm lebih professional dan sesuai standar
4. **Numbered Instructions**: Lebih clear dibanding bullet points
5. **Professional Colors**: Subtle grays dan blues, tidak terlalu kontras

### Typography Improvements:
1. **Label/Value Hierarchy**: Label dengan font kecil, value dengan font normal
2. **Consistent Spacing**: Spacing yang konsisten antar elemen
3. **Text Truncation**: Alamat panjang dipotong dengan "..."

### Layout Improvements:
1. **Box Sections**: Setiap section memiliki background terpisah
2. **Border Consistency**: Border yang konsisten tapi tidak overwhelming
3. **Spacing**: White space yang cukup antar section
4. **Professional Footer**: Footer seperti bar dengan info tersebar

## Assets yang Digunakan
- `/desain_logo.png` - Logo VBTicket untuk header (20mm)
- `/LOGO Wondr.png` - Logo Wondr untuk footer (12mm)

## Color Scheme (Professional & Clean)
- **Header Background**: #f0f8ff (very light blue)
- **Section Backgrounds**: #fcfcfc (very light gray)
- **Footer Background**: #f8fafc (light gray)
- **Borders**: #dcdcdc (light gray) / #3b82f6 (blue for header)
- **Primary Text**: #1f2937 (dark gray)
- **Labels**: #666666 (medium gray)
- **Primary Color**: #3b82f6 (blue)
