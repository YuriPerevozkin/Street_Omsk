function initMap() {
    myMap = new ymaps.Map('map', {
        center: [54.992440, 73.368591],
        zoom: 12,
        controls: ['zoomControl']
    });

    myCollection = new ymaps.GeoObjectCollection();
    myMap.geoObjects.add(myCollection);

    document.getElementById('placemarkType').addEventListener('change', function() {
        const isRequest = this.value === 'request';
        const contactFields = document.querySelectorAll('.contact-fields');
        contactFields.forEach(el => {
            el.style.display = isRequest ? 'block' : 'none';
        });
    });

    loadPlacemarks();

    myMap.events.add('click', function (e) {
        if (isSelectingMode) {
            selectedCoords = e.get('coords');
            updateCoordsDisplay();
            
            if (tempPlacemark) {
                myMap.geoObjects.remove(tempPlacemark);
            }
            
            tempPlacemark = new ymaps.Placemark(selectedCoords, {}, {
                iconLayout: 'default#image',
                iconImageHref: 'images/metka_1.png', // Иконка для временной метки
                iconImageSize: [1112, 31112],
                draggable: true
            });
                        
            myMap.geoObjects.add(tempPlacemark);
            
            tempPlacemark.events.add('dragend', function () {
                selectedCoords = tempPlacemark.geometry.getCoordinates();
                updateCoordsDisplay();
            });

            notificationManager.success('Место выбрано! Заполните информацию о метке');
            openFormModal();
            isSelectingMode = false;
        }
    });
}

function getIconForType(type) {
    const icons = {
        'street': 'images/metka_1.png',
        'request': 'images/metka_2.png'
    };
    return icons[type];
}

function loadPlacemarks() {
    myCollection.removeAll();
    placemarksData.forEach(placemark => {
        addPlacemarkToMap(placemark);
    });
}

function addPlacemarkToMap(placemarkData) {
    let balloonContent = `
        <div class="placemark-balloon">
            <div class="placemark-title">${placemarkData.name}</div>
            <div class="placemark-description">${placemarkData.description || 'Описание отсутствует'}</div>
    `;

    if (placemarkData.type === 'request') {
        balloonContent += `<div class="placemark-contacts"><strong>Контакты:</strong><br>`;
        if (placemarkData.phone) {
            balloonContent += `Телефон: ${placemarkData.phone}<br>`;
        }
        if (placemarkData.telegram) {
            balloonContent += `Telegram: @${placemarkData.telegram}`;
        }
        balloonContent += `</div>`;
    }

    balloonContent += `
            <div class="placemark-coords">
                Координаты: ${placemarkData.lat.toFixed(6)}, ${placemarkData.lng.toFixed(6)}
            </div>
            <div class="placemark-author">
                Добавлено: ${placemarkData.authorName}
            </div>
        </div>
    `;

    const iconPreset = placemarkData.type === 'request' 
        ? 'islands#violetDotIcon' 
        : 'islands#greenDotIcon';

    const placemark = new ymaps.Placemark(
        [placemarkData.lat, placemarkData.lng],
        { balloonContent, hintContent: placemarkData.name },
        {
            iconLayout: 'default#image',
            iconImageHref: getIconForType(placemarkData.type),
            iconImageSize: [32, 32],
            iconImageOffset: [-16, -16],
        balloonCloseButton: true
        }
    );

    placemark.userData = placemarkData;
    myCollection.add(placemark);
}

function openAddForm() {
    isSelectingMode = true;
    selectedCoords = null;
    
    if (tempPlacemark) {
        myMap.geoObjects.remove(tempPlacemark);
        tempPlacemark = null;
    }
    
    document.getElementById('coordLat').textContent = 'не выбраны';
    document.getElementById('coordLng').textContent = 'не выбраны';
    
    notificationManager.info('Кликните на карте для выбора места метки');
}

function openFormModal() {
    document.getElementById('addFormModal').style.display = 'block';
}

function closeAddForm() {
    document.getElementById('addFormModal').style.display = 'none';
    isSelectingMode = false;
    selectedCoords = null;
    if (tempPlacemark) {
        myMap.geoObjects.remove(tempPlacemark);
        tempPlacemark = null;
    }
}

function updateCoordsDisplay() {
    if (selectedCoords) {
        document.getElementById('coordLat').textContent = selectedCoords[0].toFixed(6);
        document.getElementById('coordLng').textContent = selectedCoords[1].toFixed(6);
    }
}

document.getElementById('placemarkForm').addEventListener('submit', function(e) {
    e.preventDefault();
    savePlacemark();
});

function savePlacemark() {
    if (!selectedCoords) {
        notificationManager.warning('Сначала выберите место на карте!');
        return;
    }

    const name = document.getElementById('placemarkName').value;
    const description = document.getElementById('placemarkDescription').value;
    const type = document.getElementById('placemarkType').value;

    if (!name) {
        notificationManager.warning('Пожалуйста, введите название метки');
        return;
    }

    const phone = document.getElementById('placemarkPhone').value || null;
    const telegram = document.getElementById('placemarkTelegram').value || null;

    const placemarkData = {
        id: nextPlacemarkId++,
        name,
        description,
        type,
        lat: selectedCoords[0],
        lng: selectedCoords[1],
        authorName: currentUser.name
    };

    if (type === 'request') {
        placemarkData.phone = phone;
        placemarkData.telegram = telegram;
    }

    placemarksData.push(placemarkData);
    addPlacemarkToMap(placemarkData);
    
    document.getElementById('placemarkForm').reset();
    document.querySelectorAll('.contact-fields').forEach(el => el.style.display = 'none');
    closeAddForm();

    notificationManager.success(`Метка "${name}" успешно добавлена!`);
}

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            if (modal.id === 'addFormModal') {
                closeAddForm();
            } else if (modal.id === 'authModal') {
                closeAuthModal();
            }
        }
    });
}
