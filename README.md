# Едем на матч! API
 
Пара слов зачем эта API
 
## Авторизация
 
### `POST /auth`
 
Авторизует пользователя по номеру телефона и паролю (либо коду из смс)

status = 201, если все ок, status = 401, если авторизация не удалась (тогда token = null)
 
Request
```
{
    "phone": "9831234567"
}
```
 
Response
```
{
	"status": 201,
    "token": "23uigejwrfhlakjdshfjaksdhfjaksdfh"
}
```

## Пользователи
 
### `GET /user/:token`

Вернуть пользовательские данные (текущего пользователя)
(если мы в дальнейшем захотим получать данные других пользователей (короче чтобы можн было смотреть профили других пользователей), то с существующем api это сделать не получится)

Response
```
{
    "name": "Vovan",
    "last_name": "Kreed",
    "own_region": "Балашиха",
    "phone": "9000000010",
    "email": "dsa@dsa.ds",
    "bio": "ffffff",
    "review": 3.5,
    "car": {
        "name": "Ford Focus",
        "year": "2020",
    },
    "status": 200  (или 204, если "name" == null, или 404, если токен неверный)
}
```

### `PUT /user/:token`

Изменить пользовательские данные

ПОТОМ ПЕРЕИМЕНОВАТЬ middle_name НА adress

Request (все поля могут быть null) (или не быть вообще)
```
{
	"name": "Ivan",
	"last_name": “Ignatenko”,
	"middle_name": “Alexandrovich”,
	"email": ”ivanignatenko28@gmail.com”,
	"car": {
		"name": “Ford Focus”, 
		"year": 2020,
    },
    "bio": “asdasdlaskldaskld … (150 letters)”
}
```
 
## Поездки

### `POST /:token/carpools`

Создать новую поездку
Вернуть ошибку если в профиле пользователя не заполнена тачка

Request 
```
{
    "match_id": 1,
	"departure_time": "2020-07-28T12:36:00.000Z",
    "own_region": "Балашиха",
	"location": "Нефтяники, ул. Малунцева",
	"seats_total": 4
}
```

Response (карпул создан, все ок)
```
{
	"status": 201,
	"carpool_id": "2354ge-jwrf-h6ak-jdshhja-knd5h"
}
```

Response (если не заполнена тачка)
```
{
	"status": 403,
	"carpool_id": null
}
```

### `GET /carpools`

Вернуть все поездки

Response
```
[
    {
        "carpool_id": "fb13ac52-8599-5b66-9112-95084831e337",
        "location": null,
        "seats_total": 1,
        "owner": {
            "name": "Анатолий",
            "last_name": "Игнатенко",
            "review": 0
        }
    }
]
```

### `DELETE /:token/carpools/:id`

Удалить поездку

## Свободные пассажиры на конкретный матч

Пассажиры, которые хотят поехать на матч, но еще не нашли попутчика (водителя)
Нужно для того, чтобы водители могли приглашать пассажиров в свой карпул

### `POST /:token/passengers`

Добавление пассажира

Request
```
{
    "departure_time": "2020-07-28T12:36:00.000Z",
    "location": "ylitsa, 37",
    "match_id": 1
}
```

### `GET /passengers/:match_id`

Получение списка свободных пассажиров

Response
```
[
    {
        "token": "022d0976-96f8-5b13-8c02-9e7d0728866b",
        "name": "Nikolay",
        "phone": "+79000000004",
        "review": 0,
        "own_region": "Видное",
        "departure_time": "2020-07-28T12:36:00.000Z",
        "location": "ylitsa, 37"
    }
    ....
]
```

## Отзывы

### `GET /carpools/:id/review`

Получение оценок по поездке

Response
```
{
	rate: 5,
	Review: text
}
```

### `POST /carpools/:id/review/[:user_id]`

Поставить оценку за поездку

Request
```
{
	rate: 5,
	Review: text
}
```

## Города и районы

### `GET /region`

Получить города (именно города). Туда входит Омск, Москва и Балашиха

Response
```
[
    {
        "name": "Воскресенск"
    },
    .....
    {
        "name": "Дмитров"
    }
]
```

### `GET /area/:region`

Получить районы Омска/Москвы/Балашихи

Пример запроса: localhost:8080/area/Омск

Response
```
[
    {
        "region_name": "Омск",
        "name": "Кировский"
    },
    ...
    {
        "region_name": "Омск",
        "name": "Ленинский"
    }
]
```

## get all

### `GET /user`

Получение списка всех пользователей

Response
```
[
    {
        "id": 2,
        "token": "82dbb21c-882e-54a6-b7a3-86a8fe8a980c",
        "name": null,
        "last_name": null,
        "middle_name": null,
        "phone": "+79502156696",
        "email": null,
        "bio": null,
        "review": 0,
        "counter_trip": 0,
        "createdAt": "2020-08-21T11:09:16.992Z",
        "updatedAt": "2020-08-21T11:09:17.609Z"
    },
    ......
    {
        "id": 1,
        "token": "824dac23-dcf5-597a-85f7-b04442f36c94",
        "name": null,
        "last_name": null,
        "middle_name": null,
        "phone": "9000000053",
        "email": null,
        "bio": null,
        "review": 4.25,
        "counter_trip": 4,
        "createdAt": "2020-08-20T12:14:49.279Z",
        "updatedAt": "2020-08-21T13:43:22.879Z"
    }
]
```

### `GET /car`

Получение списка всех машин

Response
```
[
    {
        "id": 1,
        "owner": "824dac23-dcf5-597a-85f7-b04442f36c94",
        "name": null,
        "year": null,
        "createdAt": "2020-08-20T12:14:50.210Z",
        "updatedAt": "2020-08-20T12:14:50.210Z"
    },
    ........
    {
        "id": 2,
        "owner": "82dbb21c-882e-54a6-b7a3-86a8fe8a980c",
        "name": null,
        "year": null,
        "createdAt": "2020-08-21T11:09:18.211Z",
        "updatedAt": "2020-08-21T11:09:18.211Z"
    }
]
```

## Сокеты

### `request на сервер`

Сообщение
```
{
    "user_id": "36804161-2e20-59a9-9519-009a9a7c7442", //айди того, кого добавляем в карпул
    "carpool_id": "db32b190-ccd4-5002-bcca-c87ca0c273c6", //айди карпула
    "peoples": 2, // количество человек
    "role": "driver" // "passenger" - запрос сделал пассажир, "driver" - водитель
}
```

### `request от сервера на фронт`

Сообщение
```
{
    "user": {
        "name": "Vovan",
        "token": "36804161-2e20-59a9-9519-009a9a7c7442", //для того, чтобы потом сделать response для этого пользователя, если токен не нужен, то я уберу
    }
    "carpool_id": "db32b190-ccd4-5002-bcca-c87ca0c273c6", //айди карпула
    "peoples": 2, //количество человек
    "role": "passenger", // "passenger" - запрос сделал пассажир, "driver" - водитель
    "status": 200 //200 если все ок, 405 если запрос не отправился (нет мест или доступа)
}
```

### `response на сервер`

Сообщение
```
{
    "user_id": "36804161-2e20-59a9-9519-009a9a7c7442", //кого хотим принять (или отклонить/удалить из поездки)
    "carpool_id": "db32b190-ccd4-5002-bcca-c87ca0c273c6", //айди карпула
    "status": 1 //1 - добавить в карпул, 2 - удалить из карпула (или отклонить запрос в карпул)
}
```

### `response от сервера на фронт`

Сообщение
```
{
    "status": 1, //1 - "вас приняли", 2 - "вас не приняли или удалили из принятой заранее поездки"
    "carpool_id": "db32b190-ccd4-5002-bcca-c87ca0c273c6", //айди карпула
    "user": {
        "name":
    }
    "role": "driver" // "passenger" - запрос сделал пассажир, "driver" - водитель. Честно говоря, хз зачем это тут надо, если что, могу убрать
}
```