let cellCount = 0;

// Otomatis tambahkan 3 baris grid pertama saat aplikasi dibuka
window.onload = function() {
    tambahBarisGrid();
    tambahBarisGrid();
    tambahBarisGrid();
};

function tambahBarisGrid() {
    cellCount++;
    const tbody = document.getElementById('gridTableBody');
    const tr = document.createElement('tr');
    tr.id = `row-${cellCount}`;
    tr.innerHTML = `
        <td style="font-weight: bold; color: #ff9800;">C${cellCount}</td>
        <td><input type="number" class="c1" value="0.0" step="any"></td>
        <td><input type="number" class="c2" value="0.0" step="any"></td>
        <td><input type="number" class="c3" value="0.0" step="any"></td>
        <td><input type="number" class="c4" value="0.0" step="any"></td>
        <td><button class="btn-delete" onclick="hapusBarisGrid(${cellCount})">Hapus</button></td>
    `;
    tbody.appendChild(tr);
}

function hapusBarisGrid(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) row.remove();
}

function hitungCutFillUltimate() {
    const gridSize = parseFloat(document.getElementById('gridSize').value) || 5;
    const swellFactor = parseFloat(document.getElementById('swellFactor').value) || 20;
    const elevasiRencana = parseFloat(document.getElementById('elevasiRencana').value) || 0;

    const areaPerCell = gridSize * gridSize;
    let totalCutBank = 0;
    let totalFillCompact = 0;
    let activeCells = 0;

    const rows = document.querySelectorAll('#gridTableBody tr');
    
    if (rows.length === 0) {
        alert("Peringatan: Tambahkan minimal satu kotak sel grid elevasi tanah!");
        return;
    }

    rows.forEach(row => {
        activeCells++;
        const h1 = parseFloat(row.querySelector('.c1').value) || 0;
        const h2 = parseFloat(row.querySelector('.c2').value) || 0;
        const h3 = parseFloat(row.querySelector('.c3').value) || 0;
        const h4 = parseFloat(row.querySelector('.c4').value) || 0;

        // Hitung perbedaan tinggi di setiap sudut sudut koordinat terhadap rencana
        let d1 = h1 - elevasiRencana;
        let d2 = h2 - elevasiRencana;
        let d3 = h3 - elevasiRencana;
        let d4 = h4 - elevasiRencana;

        // Formula Rata-rata Grid Elevasi (Borrow Pit Method)
        let rerataTinggiSel = (d1 + d2 + d3 + d4) / 4;
        let volumeSel = areaPerCell * Math.abs(rerataTinggiSel);

        if (rerataTinggiSel > 0) {
            totalCutBank += volumeSel;
        } else if (rerataTinggiSel < 0) {
            totalFillCompact += volumeSel;
        }
    });

    let totalLuasLahan = activeCells * areaPerCell;
    let looseVolumeCut = totalCutBank * (1 + (swellFactor / 100)); // Rumus Logistik Truk
    let netVolume = totalCutBank - totalFillCompact;

    // Distribusi Hasil ke KPI Dashboard
    document.getElementById('totalLuas').innerText = totalLuasLahan.toFixed(1) + " m²";
    document.getElementById('volCut').innerText = totalCutBank.toFixed(1) + " m³";
    document.getElementById('volFill').innerText = totalFillCompact.toFixed(1) + " m³";
    document.getElementById('volLoose').innerText = looseVolumeCut.toFixed(1) + " m³";
    
    let nettoText = netVolume.toFixed(1) + " m³ ";
    let statusText = "";

    if (netVolume > 0) {
        nettoText += "(Kelebihan Tanah)";
        statusText = "TANAH DIBUANG KELUAR SITE (DUMPING)";
        document.getElementById('statusProyek').style.color = "#ef4444";
    } else if (netVolume < 0) {
        nettoText += "(Kekurangan Tanah)";
        statusText = "BUTUH PASOKAN TANAH LUAR (IMPORT BRANGKAL)";
        document.getElementById('statusProyek').style.color = "#6366f1";
    } else {
        nettoText += "(Seimbang)";
        statusText = "ELEVASI SEIMBANG (OPTIMAL BALANCE)";
        document.getElementById('statusProyek').style.color = "#22c55e";
    }

    document.getElementById('nettoVolume').innerText = nettoText;
    document.getElementById('statusProyek').innerText = statusText;
}

function resetKalkulator() {
    document.getElementById('namaProyek').value = "";
    document.getElementById('gridTableBody').innerHTML = "";
    cellCount = 0;
    tambahBarisGrid();
    tambahBarisGrid();
    tambahBarisGrid();
    
    document.getElementById('totalLuas').innerText = "0.0 m²";
    document.getElementById('volCut').innerText = "0.0 m³";
    document.getElementById('volFill').innerText = "0.0 m³";
    document.getElementById('volLoose').innerText = "0.0 m³";
    document.getElementById('nettoVolume').innerText = "0.0 m³";
    document.getElementById('statusProyek').innerText = "Menunggu Data...";
}
