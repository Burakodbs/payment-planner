// Data Recovery Script - Restore from backup
// Usage: Run in browser console or include as module

(function() {
    console.log('🔄 Starting data recovery from backup...');

    // Backup data from JSON file (copy this data)
    const backupData = {
        "harcamalar": [
            {
                "id": "duzenli_1754317509229_2025-08",
                "tarih": "2025-08-05",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Düzenli Ödeme",
                "aciklama": "anne telefon (Düzenli)",
                "tutar": 208,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": false,
                "duzenliOdemeId": 1754317509229,
                "isRegular": true
            },
            {
                "id": 1754317386965,
                "tarih": "2025-08-04",
                "kart": "Ziraat",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "turknet berkay",
                "tutar": 1000,
                "taksitNo": 1,
                "toplamTaksit": 6,
                "isTaksit": true
            },
            {
                "id": 1754340317305,
                "tarih": "2025-08-04",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 75,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": "duzenli_1754435023174_2025-08",
                "tarih": "2025-08-03",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Düzenli Ödeme",
                "aciklama": "ihh (Düzenli)",
                "tutar": 800,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": false,
                "duzenliOdemeId": 1754435023174,
                "isRegular": true
            },
            {
                "id": 1754229369016,
                "tarih": "2025-08-01",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 399.99,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754229371984,
                "tarih": "2025-08-01",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 250,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754229375169,
                "tarih": "2025-08-01",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 48.25,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754229385864,
                "tarih": "2025-08-01",
                "kart": "Vakıf",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 200,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754229390200,
                "tarih": "2025-08-01",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 300,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754229398752,
                "tarih": "2025-08-01",
                "kart": "Vakıf",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 541.58,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754229402600,
                "tarih": "2025-08-01",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 2500,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063236036,
                "tarih": "2025-07-30",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 25,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063321620,
                "tarih": "2025-07-30",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 10,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063547628,
                "tarih": "2025-07-30",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1293.5,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063556843,
                "tarih": "2025-07-30",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 225,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063621124,
                "tarih": "2025-07-30",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 17245.68,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063218252,
                "tarih": "2025-07-29",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 81,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063228756,
                "tarih": "2025-07-29",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 115,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063312923,
                "tarih": "2025-07-29",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 385,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063219909,
                "tarih": "2025-07-28",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 75,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063547724,
                "tarih": "2025-07-28",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": null,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063668211,
                "tarih": "2025-07-28",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 3320,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063573075,
                "tarih": "2025-07-27",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 164.9,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063154884,
                "tarih": "2025-07-26",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 199.96,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063292901,
                "tarih": "2025-07-26",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 35,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063660980,
                "tarih": "2025-07-26",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 3600,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063225660,
                "tarih": "2025-07-24",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 822.48,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063273540,
                "tarih": "2025-07-24",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1625.25,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063172180,
                "tarih": "2025-07-22",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 100,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063175515,
                "tarih": "2025-07-22",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 60,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063284092,
                "tarih": "2025-07-22",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 435,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063157900,
                "tarih": "2025-07-21",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 159,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063287181,
                "tarih": "2025-07-19",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 64,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063166188,
                "tarih": "2025-07-17",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 500,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754229600094,
                "tarih": "2025-07-17",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 2142.4,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063233068,
                "tarih": "2025-07-16",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 55.35,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063160564,
                "tarih": "2025-07-14",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 59.5,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063560267,
                "tarih": "2025-07-14",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 219.5,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063300428,
                "tarih": "2025-07-13",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1713.85,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063213148,
                "tarih": "2025-07-12",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 273.9,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063543316,
                "tarih": "2025-07-12",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 2404,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063316164,
                "tarih": "2025-07-11",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 210,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063677476,
                "tarih": "2025-07-11",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 436,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063565172,
                "tarih": "2025-07-10",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 189,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063276100,
                "tarih": "2025-07-09",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1317,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063550924,
                "tarih": "2025-07-08",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 449.5,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063656868,
                "tarih": "2025-07-08",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 52.99,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063242980,
                "tarih": "2025-07-06",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 3250,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063683740,
                "tarih": "2025-07-05",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 443.99,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754065810207,
                "tarih": "2025-07-04",
                "kart": "Axess",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1300,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063204492,
                "tarih": "2025-07-02",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 330,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063305764,
                "tarih": "2025-07-02",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1600,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063651028,
                "tarih": "2025-07-02",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 64,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754061939229,
                "tarih": "2025-07-01",
                "kart": "Axess",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 880,
                "taksitNo": 2,
                "toplamTaksit": 3,
                "isTaksit": true
            },
            {
                "id": 1754062896740,
                "tarih": "2025-07-01",
                "kart": "Axess",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 11666.66,
                "taksitNo": 11,
                "toplamTaksit": 12,
                "isTaksit": true
            },
            {
                "id": 1754063119988,
                "tarih": "2025-07-01",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1158.37,
                "taksitNo": 4,
                "toplamTaksit": 6,
                "isTaksit": true
            },
            {
                "id": 1754063138429,
                "tarih": "2025-07-01",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 564,
                "taksitNo": 3,
                "toplamTaksit": 6,
                "isTaksit": true
            },
            {
                "id": 1754063146547,
                "tarih": "2025-07-01",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 355.66,
                "taksitNo": 3,
                "toplamTaksit": 6,
                "isTaksit": true
            },
            {
                "id": 1754063216060,
                "tarih": "2025-07-01",
                "kart": "Enpara",
                "kullanici": "Burak",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 150,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            },
            {
                "id": 1754063629908,
                "tarih": "2025-07-01",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1216.85,
                "taksitNo": 1,
                "toplamTaksit": 6,
                "isTaksit": true
            },
            {
                "id": 1754063645628,
                "tarih": "2025-07-01",
                "kart": "Enpara",
                "kullanici": "Semih Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 600,
                "taksitNo": 1,
                "toplamTaksit": 6,
                "isTaksit": true
            },
            {
                "id": 1754063671684,
                "tarih": "2025-07-01",
                "kart": "Enpara",
                "kullanici": "Sinan Abi",
                "kategori": "Diğer",
                "aciklama": "",
                "tutar": 1302,
                "taksitNo": null,
                "toplamTaksit": null,
                "isTaksit": null
            }
        ],
        "duzenliOdemeler": [
            {
                "id": 1754317509229,
                "ad": "anne telefon",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "tutar": 208,
                "gun": 5,
                "baslangicTarihi": "2025-08-05",
                "aciklama": "anne telefon",
                "aktif": true,
                "olusturulmaTarihi": "2025-08-04T14:25:09.229Z"
            },
            {
                "id": 1754317556140,
                "ad": "anane telefon",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "tutar": 308.5,
                "gun": 18,
                "baslangicTarihi": "2025-08-18",
                "aciklama": "anane telefon",
                "aktif": true,
                "olusturulmaTarihi": "2025-08-04T14:25:56.140Z"
            },
            {
                "id": 1754317577574,
                "ad": "burak telefon",
                "kart": "Vakıf",
                "kullanici": "Burak",
                "tutar": 306,
                "gun": 12,
                "baslangicTarihi": "2025-08-12",
                "aciklama": "burak telefon",
                "aktif": true,
                "olusturulmaTarihi": "2025-08-04T14:26:17.574Z"
            },
            {
                "id": 1754435023174,
                "aciklama": "ihh",
                "tutar": 800,
                "kart": "Vakıf",
                "kullanici": "Burak",
                "baslangicTarihi": "2025-08-03",
                "kategori": "Düzenli Ödeme"
            }
        ],
        "kredikartlari": [
            "Axess",
            "World",
            "Enpara",
            "Vakıf",
            "Ziraat"
        ],
        "kisiler": [
            "Burak",
            "Semih Abi",
            "Sinan Abi",
            "Annem",
            "Talha"
        ]
    };

    // Map Turkish field names to English for the new system
    function convertToNewFormat(backupData) {
        console.log('📋 Converting data format...');
        
        // Convert expenses (harcamalar -> expenses)
        const expenses = backupData.harcamalar.map(item => {
            // Handle null values
            if (item.tutar === null || item.tutar === undefined) {
                item.tutar = 0;
            }
            
            return {
                id: item.id,
                date: item.tarih,
                card: item.kart,
                person: item.kullanici,
                category: item.kategori,
                description: item.aciklama,
                amount: parseFloat(item.tutar) || 0,
                installmentNumber: item.taksitNo,
                totalInstallments: item.toplamTaksit,
                isInstallment: item.isTaksit || false,
                regularPaymentId: item.duzenliOdemeId,
                isRegular: item.isRegular || false
            };
        });

        // Convert regular payments (duzenliOdemeler -> regularPayments)
        const regularPayments = backupData.duzenliOdemeler.map(item => ({
            id: item.id,
            description: item.aciklama || item.ad,
            amount: parseFloat(item.tutar) || 0,
            card: item.kart,
            person: item.kullanici,
            startDate: item.baslangicTarihi,
            category: item.kategori || 'Regular Payment',
            active: item.aktif !== false // Default to true if not specified
        }));

        // Convert credit cards (kredikartlari -> creditCards)
        const creditCards = backupData.kredikartlari || [];

        // Convert people (kisiler -> people)
        const people = backupData.kisiler || [];

        return {
            expenses,
            regularPayments,
            creditCards,
            people
        };
    }

    function restoreData() {
        try {
            console.log('🔄 Converting backup data to new format...');
            const convertedData = convertToNewFormat(backupData);
            
            console.log('💾 Restoring data to localStorage...');
            
            // Restore to global variables
            if (typeof expenses !== 'undefined') {
                window.expenses = convertedData.expenses;
                console.log(`✅ Restored ${convertedData.expenses.length} expenses`);
            }
            
            if (typeof regularPayments !== 'undefined') {
                window.regularPayments = convertedData.regularPayments;
                console.log(`✅ Restored ${convertedData.regularPayments.length} regular payments`);
            }
            
            if (typeof creditCards !== 'undefined') {
                window.creditCards = convertedData.creditCards;
                console.log(`✅ Restored ${convertedData.creditCards.length} credit cards`);
            }
            
            if (typeof people !== 'undefined') {
                window.people = convertedData.people;
                console.log(`✅ Restored ${convertedData.people.length} people`);
            }

            // Save to localStorage
            localStorage.setItem('expenses', JSON.stringify(convertedData.expenses));
            localStorage.setItem('regularPayments', JSON.stringify(convertedData.regularPayments));
            localStorage.setItem('creditCards', JSON.stringify(convertedData.creditCards));
            localStorage.setItem('people', JSON.stringify(convertedData.people));
            
            // If auth system exists, save to user data as well
            if (typeof authSystem !== 'undefined' && authSystem.currentUser) {
                console.log('👤 Saving to user account...');
                authSystem.currentUserData = {
                    ...authSystem.currentUserData,
                    expenses: convertedData.expenses,
                    regularPayments: convertedData.regularPayments,
                    creditCards: convertedData.creditCards,
                    people: convertedData.people
                };
                authSystem.saveUserData();
                console.log('✅ Data saved to user account');
            }

            console.log('🎉 Data recovery completed successfully!');
            console.log(`📊 Summary:
- ${convertedData.expenses.length} expenses restored
- ${convertedData.regularPayments.length} regular payments restored  
- ${convertedData.creditCards.length} credit cards restored
- ${convertedData.people.length} people restored`);

            // Refresh UI if possible
            if (typeof updateExpenseTable === 'function') {
                updateExpenseTable();
                console.log('🔄 Updated expense table');
            }
            
            if (typeof updateDashboard === 'function') {
                updateDashboard();
                console.log('🔄 Updated dashboard');
            }

            if (typeof DataManager !== 'undefined' && DataManager.updateAllViews) {
                DataManager.updateAllViews();
                console.log('🔄 Updated all views');
            }

            return true;
            
        } catch (error) {
            console.error('❌ Error during data recovery:', error);
            return false;
        }
    }

    // Start recovery
    const success = restoreData();
    
    if (success) {
        alert('✅ Verileriniz başarıyla geri yüklendi!\n\n📊 Özet:\n- 62 harcama\n- 4 düzenli ödeme\n- 5 kredi kartı\n- 5 kişi\n\nSayfa yeniden yükleniyor...');
        setTimeout(() => window.location.reload(), 1000);
    } else {
        alert('❌ Veri geri yükleme sırasında hata oluştu. Konsolu kontrol edin.');
    }

})();
