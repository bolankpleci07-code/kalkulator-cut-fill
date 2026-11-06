function hitungCutFill() {
    let panjang = parseFloat(document.getElementById('panjang').value) || 0;
    let lebar = parseFloat(document.getElementById('lebar').value) || 0;
    let tinggiAsli = parseFloat(document.getElementById('existing').value) || 0;

    // Rumus volume (Panjang x Lebar x Tinggi Elevasi)
    let volume = panjang * lebar * tinggiAsli;

    if (tinggiAsli > 0) {
        document.getElementById('volCut').innerText = volume.toFixed(2);
        document.getElementById('volFill').innerText = "0";
        document.getElementById('statusProyek').innerText = "Perlu Galian (Cut)";
    } else if (tinggiAsli < 0) {
        document.getElementById('volCut').innerText = "0";
        document.getElementById('volFill').innerText = Math.abs(volume).toFixed(2);
        document.getElementById('statusProyek').innerText = "Perlu Timbunan (Fill)";
    } else {
        document.getElementById('volCut').innerText = "0";
        document.getElementById('volFill').innerText = "0";
        document.getElementById('statusProyek').innerText = "Lahan Sudah Sesuai Level";
    }
}
