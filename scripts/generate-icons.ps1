# Gera os icones da PWA FRETA (neon #00ff55 com "F" preto)
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Imaging

New-Item -ItemType Directory -Force -Path "public\icons" | Out-Null

function New-FretaIcon {
    param(
        [int]$Size,
        [string]$OutPath,
        [double]$PaddingRatio = 0.0,
        [int]$Radius = 0
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 255, 85))

    if ($Radius -gt 0) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $Radius * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc($Size - $d, 0, $d, $d, 270, 90)
        $path.AddArc($Size - $d, $Size - $d, $d, $d, 0, 90)
        $path.AddArc(0, $Size - $d, $d, $d, 90, 90)
        $path.CloseFigure()
        $g.FillPath($bgBrush, $path)
    } else {
        $g.FillRectangle($bgBrush, 0, 0, $Size, $Size)
    }

    $fontSize = [float]($Size * (1.0 - 2 * $PaddingRatio) * 0.62)
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 4, 4, 4))
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $g.DrawString("F", $font, $textBrush, $rect, $fmt)

    $g.Dispose()
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host ("OK " + $OutPath + " (" + $Size + "x" + $Size + ")")
}

New-FretaIcon -Size 192 -OutPath "public\icons\icon-192x192.png" -Radius 36
New-FretaIcon -Size 512 -OutPath "public\icons\icon-512x512.png" -Radius 96
New-FretaIcon -Size 512 -OutPath "public\icons\icon-maskable-512x512.png" -PaddingRatio 0.20

Write-Host "Icones gerados."
