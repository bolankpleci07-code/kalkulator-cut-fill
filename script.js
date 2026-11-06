function hitung() {
    const nama = document.getElementById("namaProyek").value;
    const panjang = Number(document.getElementById("panjang").value);
    const lebar = Number(document.getElementById("lebar").value);
    const design = Number(document.getElementById("design").value);

    const ids = ["A", "B", "C", "D"];
    const nilai = {};

    for (const id of ids) {
        const input = document.getElementById(id);

        if (input.value.trim() === "") {
            alert("Elevasi titik " + id + " belum diisi!");
            return;
        }

        nilai[id] = Number(input.value);

        if (!Number.isFinite(nilai[id])) {
            alert("Elevasi tidak valid!");
            return;
        }
    }

    if (!nama || panjang <= 0 || lebar <= 0 ||
        !Number.isFinite(design)) {
        alert("Periksa semua data proyek dan ukuran grid!");
        return;
    }

    const luas = panjang * lebar;

    const titik = [
        {x: 0, y: 0, h: nilai.A - design},
        {x: panjang, y: 0, h: nilai.B - design},
        {x: panjang, y: lebar, h: nilai.C - design},
        {x: 0, y: lebar, h: nilai.D - design}
    ];

    // Membagi grid menjadi dua segitiga
    const segitiga = [
        [titik[0], titik[1], titik[2]],
        [titik[0], titik[2], titik[3]]
    ];

    function potong(poly, positif) {
        const hasil = [];

        for (let i = 0; i < poly.length; i++) {
            const p = poly[i];
            const q = poly[(i + 1) % poly.length];

            const masukP = positif ? p.h >= 0 : p.h <= 0;
            const masukQ = positif ? q.h >= 0 : q.h <= 0;

            if (masukP) hasil.push(p);

            if (masukP !== masukQ) {
                const t = p.h / (p.h - q.h);

                hasil.push({
                    x: p.x + t * (q.x - p.x),
                    y: p.y + t * (q.y - p.y),
                    h: 0
                });
            }
        }

        return hasil;
    }

    function volume(poly) {
        let total = 0;

        for (let i = 1; i < poly.length - 1; i++) {
            const p = poly[0];
            const q = poly[i];
            const r = poly[i + 1];

            const area = Math.abs(
                (q.x - p.x) * (r.y - p.y) -
                (q.y - p.y) * (r.x - p.x)
            ) / 2;

            total += area *
                (Math.abs(p.h) +
                 Math.abs(q.h) +
                 Math.abs(r.h)) / 3;
        }

        return total;
    }

    let cut = 0;
    let fill = 0;

    for (const tri of segitiga) {
        cut += volume(potong(tri, true));
        fill += volume(potong(tri, false));
    }

    const net = cut - fill;

    document.getElementById("hasil").innerHTML = `
        <h2>Hasil Perhitungan</h2>
        <p>Proyek: ${nama.replace(/</g, "&lt;")}</p>
        <p>Luas Grid: ${luas.toFixed(2)} m²</p>
        <p>Volume CUT: ${cut.toFixed(3)} m³</p>
        <p>Volume FILL: ${fill.toFixed(3)} m³</p>
        <h3>Volume Bersih: ${net.toFixed(3)} m³</h3>
    `;
}
