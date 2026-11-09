$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$RootDir = Split-Path -Parent $PSScriptRoot
$PackagedDir = Join-Path $RootDir "NACORA_Paket_Antigravity\NACORA"
foreach ($sub in @("data", "referensi")) {
    $targetSub = Join-Path $RootDir $sub
    $sourceSub = Join-Path $PackagedDir $sub
    if (-not (Test-Path $targetSub) -and (Test-Path $sourceSub)) {
        Copy-Item -Path $sourceSub -Destination $targetSub -Recurse -Force
    }
}

$ExcelPath = Join-Path $RootDir "data\NACORA_Database_Final.xlsx"
$FotoSrcDir = Join-Path $RootDir "data\foto"
$OutDataDir = Join-Path $RootDir "public\data"
$OutFotoDir = Join-Path $RootDir "public\foto"

Write-Host "===================================================="
Write-Host " NACORA Data Converter & Validator (npm run data)"
Write-Host "===================================================="

if (-not (Test-Path $ExcelPath)) {
    Write-Error "GALAT: Berkas Excel tidak ditemukan di $ExcelPath"
    exit 1
}

$Whitelist = @{
    "Bahan" = @(
        "ID", "Nama Bahan", "Kelompok Pigmen", "Sumber Bahan", "Bentuk", "Warna",
        "HEX", "Kelarutan", "Kategori Pangan", "pH Min", "pH Max",
        "Stabilitas Panas", "Stabilitas Cahaya", "Proses yang Cocok",
        "Kemasan", "Penyimpanan", "Dosis Acuan", "Kelebihan", "Keterbatasan & Tips",
        "Bahan Hewani", "Warna Dasar", "Perubahan Warna per Konsentrasi",
        "Sifat Fisik", "Sifat pH", "Catatan Evaluasi", "Foto", "Rujukan"
    )
    "Kombinasi" = @(
        "ID Kombinasi", "Warna Hasil", "Skor", "Bahan A", "ID A",
        "Bahan B", "ID B", "Rasio A:B", "Rentang Rasio",
        "HEX A", "HEX B", "HEX Hasil", "pH Min", "pH Max",
        "Proses Kompatibel", "Catatan"
    )
    "Booklet" = @(
        "Kelompok", "Pengenalan", "Karakteristik Warna", "Kelarutan",
        "Faktor Stabilitas", "Aplikasi Pangan", "Kelebihan dan Keterbatasan", "Rujukan"
    )
    "Kategori Pangan" = @("Kode", "Nama Kategori", "Level", "Kode Induk")
    "Pilihan Form" = @("Jenis", "Nilai", "Keterangan", "HEX (UI)")
    "Rujukan" = @("Kode", "Rujukan", "Tautan")
}

$ValidColors = @("Yellow", "Orange", "Red", "Green", "Blue", "Purple", "Black")

function Convert-ColLettersToIndex([string]$letters) {
    $idx = 0
    foreach ($ch in $letters.ToCharArray()) {
        $idx = $idx * 26 + ([int][char]$ch - 64)
    }
    return $idx - 1
}

function Clean-Str($val) {
    if ($null -eq $val) { return $null }
    $s = [string]$val
    $s = $s.Trim()
    if ($s -eq "") { return $null }
    return $s
}

function Split-List($val) {
    $s = Clean-Str $val
    if ($null -eq $s) { return @() }
    $items = $s -split ";" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    return @($items)
}

function Parse-Num($val) {
    $s = Clean-Str $val
    if ($null -eq $s) { return $null }
    $normalized = $s.Replace(",", ".")
    $num = 0.0
    if ([double]::TryParse($normalized, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$num)) {
        if ($num -eq [math]::Floor($num) -and $normalized -notmatch "\.") {
            return [int]$num
        }
        return $num
    }
    return "NaN"
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($ExcelPath)
$sharedStrings = @()
$ssEntry = $zip.GetEntry("xl/sharedStrings.xml")
if ($null -ne $ssEntry) {
    $sr = New-Object System.IO.StreamReader($ssEntry.Open())
    [xml]$ssXml = $sr.ReadToEnd()
    $sr.Close()
    foreach ($si in $ssXml.sst.si) {
        $sharedStrings += $si.InnerText
    }
}

$wbEntry = $zip.GetEntry("xl/workbook.xml")
$sr = New-Object System.IO.StreamReader($wbEntry.Open())
[xml]$wbXml = $sr.ReadToEnd()
$sr.Close()

$relsEntry = $zip.GetEntry("xl/_rels/workbook.xml.rels")
$sr = New-Object System.IO.StreamReader($relsEntry.Open())
[xml]$relsXml = $sr.ReadToEnd()
$sr.Close()

$relMap = @{}
foreach ($rel in $relsXml.Relationships.Relationship) {
    $t = $rel.Target.TrimStart("/")
    if (-not $t.StartsWith("xl/")) { $t = "xl/" + $t }
    $relMap[$rel.Id] = $t
}

$Workbook = @{}
foreach ($sh in $wbXml.workbook.sheets.sheet) {
    $sheetName = $sh.name
    $rId = $sh.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
    $targetPath = $relMap[$rId]
    $shEntry = $zip.GetEntry($targetPath)
    if ($null -eq $shEntry) { continue }
    $sr = New-Object System.IO.StreamReader($shEntry.Open())
    [xml]$shXml = $sr.ReadToEnd()
    $sr.Close()

    $rows = @()
    foreach ($r in $shXml.worksheet.sheetData.row) {
        $rowCells = @{}
        $maxCol = -1
        foreach ($c in $r.c) {
            $ref = $c.r
            if ($ref -match "^([A-Z]+)\d+$") {
                $colIdx = Convert-ColLettersToIndex $Matches[1]
                if ($colIdx -gt $maxCol) { $maxCol = $colIdx }
                $cellType = $c.t
                $val = ""
                if ($cellType -eq "inlineStr") {
                    $val = $c.is.InnerText
                } elseif ($null -ne $c.v) {
                    $rawV = $c.v
                    if ($cellType -eq "s") {
                        $val = $sharedStrings[[int]$rawV]
                    } else {
                        $val = [string]$rawV
                    }
                }
                $rowCells[$colIdx] = $val
            }
        }
        $rows += ,$rowCells
    }

    if ($rows.Count -gt 0) {
        $headerCells = $rows[0]
        $headers = @{}
        $headerList = @()
        foreach ($k in ($headerCells.Keys | Sort-Object)) {
            $hName = ([string]$headerCells[$k]).Trim()
            if ($hName -ne "") {
                $headers[$k] = $hName
                $headerList += $hName
            }
        }
        $dataRows = @()
        for ($i = 1; $i -lt $rows.Count; $i++) {
            $rc = $rows[$i]
            $hasVal = $false
            $obj = @{}
            foreach ($k in $headers.Keys) {
                $colName = $headers[$k]
                $v = if ($rc.ContainsKey($k)) { ([string]$rc[$k]).Trim() } else { "" }
                if ($v -ne "") { $hasVal = $true }
                $obj[$colName] = $v
            }
            if ($hasVal) {
                $dataRows += ,$obj
            }
        }
        $Workbook[$sheetName] = @{
            Headers = $headerList
            Rows = $dataRows
        }
    }
}
$zip.Dispose()

$errors = @()
$warnings = @()

foreach ($sheetName in $Whitelist.Keys) {
    if (-not $Workbook.ContainsKey($sheetName)) {
        $errors += "Sheet wajib '$sheetName' tidak ditemukan di Excel."
        continue
    }
    $actualHeaders = $Workbook[$sheetName].Headers
    foreach ($col in $Whitelist[$sheetName]) {
        if ($actualHeaders -notcontains $col) {
            $errors += "Kolom wajib '$col' tidak ditemukan pada sheet '$sheetName'."
        }
    }
    $extraCols = $actualHeaders | Where-Object { $Whitelist[$sheetName] -notcontains $_ }
    if ($extraCols.Count -gt 0) {
        $warnings += "Sheet '$sheetName' memiliki kolom di luar daftar putih yang diabaikan: $($extraCols -join ', ')"
    }
}

if ($errors.Count -gt 0) {
    Write-Error ("Validasi struktur gagal:`n- " + ($errors -join "`n- "))
    exit 1
}

# 1. Sheet Bahan
$seenIds = New-Object System.Collections.Generic.HashSet[string]
$materials = @()
$noPhCount = 0
$noPhotoCount = 0
$noHexCount = 0
$noEvalCount = 0

$bahanRows = $Workbook["Bahan"].Rows
for ($idx = 0; $idx -lt $bahanRows.Count; $idx++) {
    $raw = $bahanRows[$idx]
    $rowNum = $idx + 2
    $id = Clean-Str $raw["ID"]
    if ($null -eq $id -or $id -notmatch "^NC-\d{3}$") {
        $errors += "Bahan baris ${rowNum}: ID '$id' tidak berformat NC-###."
    } elseif ($seenIds.Contains($id)) {
        $errors += "Bahan baris ${rowNum}: ID duplikat '$id'."
    } else {
        [void]$seenIds.Add($id)
    }

    $name = Clean-Str $raw["Nama Bahan"]
    if ($null -eq $name) { $errors += "Bahan ${id}: Nama Bahan kosong." }

    $group = Clean-Str $raw["Kelompok Pigmen"]
    if ($null -eq $group) { $errors += "Bahan ${id}: Kelompok Pigmen kosong." }

    $colors = @(Split-List $raw["Warna"])
    if ($colors.Count -eq 0) {
        $errors += "Bahan ${id}: Kolom Warna kosong."
    }
    foreach ($c in $colors) {
        if ($ValidColors -notcontains $c) {
            $errors += "Bahan ${id}: Warna '$c' tidak sah."
        }
    }

    $hex = Clean-Str $raw["HEX"]
    if ($null -ne $hex -and $hex -notmatch "^#[0-9A-Fa-f]{6}$") {
        $errors += "Bahan ${id}: HEX '$hex' tidak berformat #RRGGBB."
    }
    if ($null -eq $hex) { $noHexCount++ }

    $phMin = Parse-Num $raw["pH Min"]
    $phMax = Parse-Num $raw["pH Max"]
    if ($phMin -eq "NaN" -or $phMax -eq "NaN") {
        $errors += "Bahan ${id}: Nilai pH bukan angka yang sah."
    } else {
        if ($null -ne $phMin -and ($phMin -lt 0 -or $phMin -gt 14)) {
            $errors += "Bahan ${id}: pH Min ($phMin) di luar rentang 0-14."
        }
        if ($null -ne $phMax -and ($phMax -lt 0 -or $phMax -gt 14)) {
            $errors += "Bahan ${id}: pH Max ($phMax) di luar rentang 0-14."
        }
        if ($null -ne $phMin -and $null -ne $phMax -and $phMin -gt $phMax) {
            $errors += "Bahan ${id}: pH Min ($phMin) > pH Max ($phMax)."
        }
    }
    if ($null -eq $phMin -and $null -eq $phMax) { $noPhCount++ }

    $photos = @(Split-List $raw["Foto"])
    if ($photos.Count -eq 0) {
        $noPhotoCount++
    } else {
        foreach ($pFile in $photos) {
            $pPath = Join-Path $FotoSrcDir $pFile
            if (-not (Test-Path $pPath)) {
                $errors += "Bahan ${id}: Berkas foto '$pFile' tidak ditemukan di data/foto/."
            }
        }
    }

    $evalBase = Clean-Str $raw["Warna Dasar"]
    $evalConc = Clean-Str $raw["Perubahan Warna per Konsentrasi"]
    $evalPhys = Clean-Str $raw["Sifat Fisik"]
    $evalPh   = Clean-Str $raw["Sifat pH"]
    $evalNote = Clean-Str $raw["Catatan Evaluasi"]
    if ($null -eq $evalBase -and $null -eq $evalConc -and $null -eq $evalPhys -and $null -eq $evalPh -and $null -eq $evalNote) {
        $noEvalCount++
    }

    $animalRaw = Clean-Str $raw["Bahan Hewani"]
    $animal = ($null -ne $animalRaw -and $animalRaw.ToLower() -eq "ya")

    $materials += [ordered]@{
        id = $id
        name = $name
        group = $group
        source = Clean-Str $raw["Sumber Bahan"]
        form = Clean-Str $raw["Bentuk"]
        colors = $colors
        hex = $hex
        solubility = Clean-Str $raw["Kelarutan"]
        categories = @(Split-List $raw["Kategori Pangan"])
        ph = [ordered]@{
            min = $phMin
            max = $phMax
        }
        heat = Clean-Str $raw["Stabilitas Panas"]
        light = Clean-Str $raw["Stabilitas Cahaya"]
        processes = @(Split-List $raw["Proses yang Cocok"])
        packaging = Clean-Str $raw["Kemasan"]
        storage = Clean-Str $raw["Penyimpanan"]
        dosage = Clean-Str $raw["Dosis Acuan"]
        pros = Clean-Str $raw["Kelebihan"]
        cons = Clean-Str $raw["Keterbatasan & Tips"]
        animal = $animal
        evaluation = [ordered]@{
            baseColor = $evalBase
            concentration = $evalConc
            physical = $evalPhys
            phNote = $evalPh
            notes = $evalNote
        }
        photos = $photos
        refs = @(Split-List $raw["Rujukan"])
    }
}

if ($noPhCount -gt 0) { $warnings += "$noPhCount bahan tidak memiliki data pH (akan dilewati saat penyaringan pH)." }
if ($noPhotoCount -gt 0) { $warnings += "$noPhotoCount bahan tidak memiliki foto (galeri disembunyikan pada detail)." }
if ($noHexCount -gt 0) { $warnings += "$noHexCount bahan tidak memiliki kode HEX." }
if ($noEvalCount -gt 0) { $warnings += "$noEvalCount bahan tidak memiliki catatan evaluasi laboratorium." }

# 2. Sheet Kombinasi
$combinations = @()
$seenComboIds = New-Object System.Collections.Generic.HashSet[string]
$kombRows = $Workbook["Kombinasi"].Rows
for ($idx = 0; $idx -lt $kombRows.Count; $idx++) {
    $raw = $kombRows[$idx]
    $rowNum = $idx + 2
    $id = Clean-Str $raw["ID Kombinasi"]
    if ($null -eq $id) {
        $errors += "Kombinasi baris ${rowNum}: ID Kombinasi kosong."
    } elseif ($seenComboIds.Contains($id)) {
        $errors += "Kombinasi baris ${rowNum}: ID Kombinasi duplikat '$id'."
    } else {
        [void]$seenComboIds.Add($id)
    }

    $resultColor = Clean-Str $raw["Warna Hasil"]
    if ($null -eq $resultColor -or ($ValidColors -notcontains $resultColor)) {
        $errors += "Kombinasi ${id}: Warna Hasil '$resultColor' tidak sah."
    }

    $score = Parse-Num $raw["Skor"]
    if ($null -eq $score -or $score -eq "NaN") {
        $errors += "Kombinasi ${id}: Skor tidak valid."
    }

    $idA = Clean-Str $raw["ID A"]
    $idB = Clean-Str $raw["ID B"]
    if ($null -eq $idA -or -not $seenIds.Contains($idA)) {
        $errors += "Kombinasi ${id}: ID A '$idA' tidak ditemukan di sheet Bahan."
    }
    if ($null -eq $idB -or -not $seenIds.Contains($idB)) {
        $errors += "Kombinasi ${id}: ID B '$idB' tidak ditemukan di sheet Bahan."
    }

    $hexA = Clean-Str $raw["HEX A"]
    $hexB = Clean-Str $raw["HEX B"]
    $resultHex = Clean-Str $raw["HEX Hasil"]
    foreach ($pair in @(@("HEX A", $hexA), @("HEX B", $hexB), @("HEX Hasil", $resultHex))) {
        if ($null -eq $pair[1] -or $pair[1] -notmatch "^#[0-9A-Fa-f]{6}$") {
            $errors += "Kombinasi ${id}: $($pair[0]) '$($pair[1])' tidak valid."
        }
    }

    $phMin = Parse-Num $raw["pH Min"]
    $phMax = Parse-Num $raw["pH Max"]
    if ($phMin -eq "NaN" -or $phMax -eq "NaN") {
        $errors += "Kombinasi ${id}: Nilai pH bukan angka yang sah."
    } else {
        if ($null -ne $phMin -and ($phMin -lt 0 -or $phMin -gt 14)) {
            $errors += "Kombinasi ${id}: pH Min ($phMin) di luar rentang 0-14."
        }
        if ($null -ne $phMax -and ($phMax -lt 0 -or $phMax -gt 14)) {
            $errors += "Kombinasi ${id}: pH Max ($phMax) di luar rentang 0-14."
        }
        if ($null -ne $phMin -and $null -ne $phMax -and $phMin -gt $phMax) {
            $errors += "Kombinasi ${id}: pH Min ($phMin) > pH Max ($phMax)."
        }
    }

    $combinations += [ordered]@{
        id = $id
        resultColor = $resultColor
        score = $score
        a = [ordered]@{
            id = $idA
            name = Clean-Str $raw["Bahan A"]
            hex = $hexA
        }
        b = [ordered]@{
            id = $idB
            name = Clean-Str $raw["Bahan B"]
            hex = $hexB
        }
        ratio = Clean-Str $raw["Rasio A:B"]
        ratioRange = Clean-Str $raw["Rentang Rasio"]
        resultHex = $resultHex
        ph = [ordered]@{
            min = $phMin
            max = $phMax
        }
        processes = @(Split-List $raw["Proses Kompatibel"])
        notes = Clean-Str $raw["Catatan"]
    }
}

# 3. Sheet Booklet
$booklet = @()
foreach ($raw in $Workbook["Booklet"].Rows) {
    $booklet += [ordered]@{
        group = Clean-Str $raw["Kelompok"]
        introduction = Clean-Str $raw["Pengenalan"]
        colorCharacteristics = Clean-Str $raw["Karakteristik Warna"]
        solubility = Clean-Str $raw["Kelarutan"]
        stabilityFactors = Clean-Str $raw["Faktor Stabilitas"]
        foodApplications = Clean-Str $raw["Aplikasi Pangan"]
        prosAndCons = Clean-Str $raw["Kelebihan dan Keterbatasan"]
        refs = @(Split-List $raw["Rujukan"])
    }
}

# 4. Sheet Kategori Pangan
$categories = @()
foreach ($raw in $Workbook["Kategori Pangan"].Rows) {
    $lvl = Parse-Num $raw["Level"]
    if ($null -eq $lvl -or $lvl -eq "NaN") { $lvl = 1 }
    $categories += [ordered]@{
        code = Clean-Str $raw["Kode"]
        name = Clean-Str $raw["Nama Kategori"]
        level = $lvl
        parentCode = Clean-Str $raw["Kode Induk"]
    }
}

# 5. Sheet Pilihan Form
$options = @()
$optRows = $Workbook["Pilihan Form"].Rows
for ($idx = 0; $idx -lt $optRows.Count; $idx++) {
    $raw = $optRows[$idx]
    $hex = Clean-Str $raw["HEX (UI)"]
    if ($null -ne $hex -and $hex -notmatch "^#[0-9A-Fa-f]{6}$") {
        $errors += "Pilihan Form baris $($idx + 2): HEX '$hex' tidak valid."
    }
    $options += [ordered]@{
        type = Clean-Str $raw["Jenis"]
        value = Clean-Str $raw["Nilai"]
        description = Clean-Str $raw["Keterangan"]
        hex = $hex
    }
}

# 6. Sheet Rujukan
$references = @()
foreach ($raw in $Workbook["Rujukan"].Rows) {
    $rawUrl = Clean-Str $raw["Tautan"]
    $references += [ordered]@{
        code = Clean-Str $raw["Kode"]
        title = Clean-Str $raw["Rujukan"]
        url = if ($rawUrl -eq "-") { $null } else { $rawUrl }
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`nVALIDASI GAGAL DENGAN GALAT:" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  [ERROR] $e" -ForegroundColor Red
    }
    exit 1
}

New-Item -ItemType Directory -Force -Path $OutDataDir | Out-Null
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$filesToWrite = @(
    @("materials.json", $materials),
    @("combinations.json", $combinations),
    @("booklet.json", $booklet),
    @("categories.json", $categories),
    @("options.json", $options),
    @("references.json", $references)
)

foreach ($item in $filesToWrite) {
    $outPath = Join-Path $OutDataDir $item[0]
    $jsonText = ConvertTo-Json -InputObject $item[1] -Depth 10
    [System.IO.File]::WriteAllText($outPath, $jsonText, $utf8NoBom)
}

New-Item -ItemType Directory -Force -Path $OutFotoDir | Out-Null
$copiedPhotos = 0
if (Test-Path $FotoSrcDir) {
    $fotoFiles = Get-ChildItem -Path $FotoSrcDir -File
    foreach ($f in $fotoFiles) {
        Copy-Item -Path $f.FullName -Destination (Join-Path $OutFotoDir $f.Name) -Force
        $copiedPhotos++
    }
}

Write-Host ""
Write-Host "[STATUS] VALIDASI LULUS (0 galat)"
Write-Host "----------------------------------------------------"
Write-Host "- Bahan (materials.json)        : $($materials.Count) bahan"
Write-Host "- Kombinasi (combinations.json) : $($combinations.Count) kombinasi"
Write-Host "- Booklet (booklet.json)        : $($booklet.Count) halaman kelompok"
Write-Host "- Kategori (categories.json)    : $($categories.Count) kategori pangan"
Write-Host "- Opsi Form (options.json)      : $($options.Count) baris opsi"
Write-Host "- Rujukan (references.json)     : $($references.Count) rujukan"
Write-Host "- Foto disalin ke public/foto/  : $copiedPhotos berkas foto"
Write-Host "----------------------------------------------------"
if ($warnings.Count -gt 0) {
    Write-Host "Catatan / Peringatan Data:"
    foreach ($w in $warnings) {
        Write-Host "  [INFO] $w"
    }
} else {
    Write-Host "Catatan / Peringatan Data: Tidak ada peringatan."
}
Write-Host "===================================================="

