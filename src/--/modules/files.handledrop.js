function handleDrop(e) {
  this.file = e.dataTransfer.files[0];
  const reader = new FileReader();

  reader.onload = (imgFile) => {
    console.log(imgFile)
    const data = imgFile.target["result"];
    fabric.Image.fromURL(data, (img) => {
      let oImg = img.set({
        left: 0,
        top: 0,
        angle: 0
      }).scale(1);
      this.canvas.add(oImg).renderAll();
      var a = this.canvas.setActiveObject(oImg);
      var dataURL = this.canvas.toDataURL({format: 'png', quality: 0.8});
    });
  };
  reader.readAsDataURL(this.file);
  return false;
}
//
// <div
//   (dragover)="false"
//   (dragend)="false"
//   (drop)="handleDrop($event)">
//   <canvas id="canvas" class="canvas" width="500" height="500">
//   </canvas>
// </div>