$res = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/v1/search?q=Tivi'
Write-Host "Total: $($res.total)"
Write-Host "=== Products ==="
foreach ($p in $res.results.products) {
    Write-Host "- $($p.name) (Brand: $($p.brand.name))"
}
Write-Host "=== Dynamic Attributes ==="
foreach ($a in $res.facets.attributes) {
    Write-Host "Attr: $($a.name)"
    foreach ($v in $a.values) {
        Write-Host "   $($v.value): $($v.count)"
    }
}
