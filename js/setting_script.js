  let cropper;
  let currentImageType = '';
  let atinImgData = '/assets/atin_img.png';
  let riefkyImgData = '/assets/riefky_img.png';

  const atinImgInput = document.getElementById('atinImgInput');
  const riefkyImgInput = document.getElementById('riefkyImgInput');
  const modal = document.getElementById('cropModal');
  const imageToCrop = document.getElementById('imageToCrop');
  const cropButton = document.getElementById('cropButton');

  atinImgInput.addEventListener('change', (e) => handleImageUpload(e, 'atin'));
  riefkyImgInput.addEventListener('change', (e) => handleImageUpload(e, 'riefky'));

  function handleImageUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    currentImageType = type;
    const reader = new FileReader();
    reader.onload = (event) => {
      imageToCrop.src = event.target.result;
      modal.style.display = 'block';
      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(imageToCrop, {
        aspectRatio: 426 / 585,
        viewMode: 1,
      });
    };
    reader.readAsDataURL(file);
  }

  cropButton.addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas({
      width: 426,
      height: 585,
    });
    const croppedImageData = canvas.toDataURL('image/png');

    if (currentImageType === 'atin') {
      atinImgData = croppedImageData;
      document.getElementById('atinImgPreview').src = croppedImageData;
    } else if (currentImageType === 'riefky') {
      riefkyImgData = croppedImageData;
      document.getElementById('riefkyImgPreview').src = croppedImageData;
    }

    modal.style.display = 'none';
    cropper.destroy();
  });

  function saveSettings() {
    const settings = {
      houseDialogue: document.getElementById('houseDialogue').value,
      cityDialogue: document.getElementById('cityDialogue').value,
      cakeDialogue1: document.getElementById('cakeDialogue1').value,
      cakeDialogue2: document.getElementById('cakeDialogue2').value,
      atin_img: atinImgData,
      riefky_img: riefkyImgData
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    alert('settings.json file has been generated for download. Please replace the existing file in the project directory.');
  }

  function loadSettings() {
    fetch('settings.json')
      .then(response => response.json())
      .then(settings => {
        document.getElementById('houseDialogue').value = settings.houseDialogue;
        document.getElementById('cityDialogue').value = settings.cityDialogue;
        document.getElementById('cakeDialogue1').value = settings.cakeDialogue1;
        document.getElementById('cakeDialogue2').value = settings.cakeDialogue2;
        
        if(settings.atin_img) {
            atinImgData = settings.atin_img;
            document.getElementById('atinImgPreview').src = settings.atin_img;
        }
        if(settings.riefky_img) {
            riefkyImgData = settings.riefky_img;
            document.getElementById('riefkyImgPreview').src = settings.riefky_img;
        }
      })
      .catch(error => console.error('Error loading settings:', error));
  }

  window.onload = loadSettings;