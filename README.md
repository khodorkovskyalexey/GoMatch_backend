# Едем на матч! API
 
API для приложения "Едем на матч!" от ХК "Авангард"
Ссылка на фронтенд: https://github.com/Lugburz13/letsGoToTheMatchV2
 
## Авторизация
 
### `POST /auth`
 
Авторизует пользователя по номеру телефона и паролю (либо коду из смс)

status = 201, если все ок, status = 401, если авторизация не удалась (тогда token = null)
 
Request
```json
{
    "phone": "9831234567"
}
```
 
Response
```json
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
```json
{
	"name": "Ivan",
	"last_name": "Ignatenko",
	"middle_name": "Alexandrovich",
	"email": "ivanignatenko28@gmail.com",
	"car": {
		"name": "Ford Focus", 
		"year": 2020,
    },
    "bio": "asdasdlaskldaskld ... (150 letters)"
}
```
 
## Поездки

### `POST /:token/carpools`

Создать новую поездку
Вернуть ошибку если в профиле пользователя не заполнена тачка

Request 
```json
{
    "match_id": 1,
	"departure_time": "2020-07-28T12:36:00.000Z",
    "own_region": "Балашиха",
	"location": "Нефтяники, ул. Малунцева",
	"seats_total": 4
}
```

Response (карпул создан, все ок)
```json
{
	"status": 201,
	"carpool_id": "2354ge-jwrf-h6ak-jdshhja-knd5h"
}
```

Response (если не заполнена тачка)
```json
{
	"status": 403,
	"carpool_id": null
}
```

### `GET /carpools`

Вернуть все поездки

Response
```json
[
    {
        "carpool_id": "4e8a8eff-1c04-5ae3-9b1d-7ec4db6c8c88",
        "location": "Нефтяники, ул. Малунцева",
        "seats_total": 4,
        "owner": {
            "name": "Иван",
            "last_name": "Игнатенко",
            "review": 0,
            "phone": "+79502166636"
        },
        "departure_time": "2020-09-21T19:06:00.000Z",
        "own_region": "Балашиха",
        "match_id": 1
    }
]
```

### `GET /carpools/:match_id`

Вернуть все поездки на конкретный матч
Возвращаются только те поездки, время отправления которых еще не подошло (или прошло только 15 минут (вдруг водитель еще не успел уехать))

Response
```json
[
    {
            "carpool_id": "db32b190-ccd4-5002-bcca-c87ca0c273c6",
            "location": "Нефтяники, ул. Малунцева",
            "seats_total": 4,
            "owner": {
                "name": "Vitalik",
                "last_name": null,
                "review": 0,
                "phone": "+79502156696"
            },
            "departure_time": "2020-10-28T12:36:00.000Z",
            "own_region": "Балашиха",
            "match_id": 1,
            "car": {
                "name": "Ford Focus",
                "year": 2020
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
```json
{
    "departure_time": "2020-07-28T12:36:00.000Z",
    "location": "ylitsa, 37",
    "match_id": 1
}
```

### `GET /passengers/:match_id`

Получение списка свободных пассажиров

Response
```json
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
```json
{
	"rate": 5,
	"Review": "text"
}
```

### `POST /carpools/:id/review/[:user_id]`

Поставить оценку за поездку

Request
```json
{
	"rate": 5,
	"Review": "text"
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

## Сокеты с фронта на сервер

### `add_request`
Отправить запрос в карпул

Сообщение
```json
{
    "user_id": "36804161-2e20-59a9-9519-009a9a7c7442",
    "carpool_id": "db32b190-ccd4-5002-bcca-c87ca0c273c6",
    "peoples": 2,
    "role": "driver"
}
```

user_id - айди того, кого добавляем в карпул
carpool_id - айди карпула
peoples - количество человек
role - "passenger" - запрос сделал пассажир, "driver" - водитель

### `accept_request`
Принять запрос в карпул

Сообщение
```json
{
  "request_id": "32bcb1aa-d10b-5859-a816-ace09c4bbd70"

}
```

### `cancel_request`
Отказаться от заявки в карпул

Сообщение
```json
{
  "request_id": "32bcb1aa-d10b-5859-a816-ace09c4bbd70"

}
```

## Сокеты с сервера на фронт

### `feedback`

Информация о результате отправленного запроса.
Если success: true, то все ок.
Если success: false, то запрос не отправлен.
recipient_name - имя пользователя, которому отправлен запрос.
Если recipient_name: "", то значит, что передан неверный request_token 
и нет возможности узнать recipient_name (description: "request_data == null")
Приходит тому пользователю, который отправил запрос!

```json
{
    "success": false,
    "recipient_name": "Stas",
    "request_token": "",
    "description": "request.cancelled === true",
    "socket": "add_request"
}
```
или
```json
{
    "success": true,
    "recipient_name": "Stas",
    "request_token": "32bcb1aa-d10b-5859-a816-ace09c4bbd70",
    "description": "",
    "socket": "add_request"
}
```

### `message_new_request`

Входящий запрос. 
Приходит получателю заявки в карпул. 
Тому, кого приглашают.

```json
{
  "req_user_data": {
    "name": "Stas",
    "last_name": null,
    "own_region": "Видное",
    "bio": null,
    "review": 4.25,
    "car": {
      "name": "Ford Focus",
      "year": 2020
    }
  },
  "req_carpool": {
    "carpool_id": "e591077d-bfb2-5c44-91cc-18bc3b80c68f",
    "departure_time": "2021-07-28T12:36:00.000Z",
    "match_id": 1,
    "own_region": "Балашиха",
    "location": "Нефтяники, ул. Малунцева",
    "seats_total": 4,
    "free_seats": 2
  },
  "req_peoples": 2,
  "req_user_role": "driver"
}
```

### `message_accept_request`
```json
{
  "req_peoples_count": 2,
  "req_carpool": {
    "departure_time": "2021-07-28T12:36:00.000Z",
    "match_id": 1,
    "own_region": "Балашиха",
    "location": "Нефтяники, ул. Малунцева",
    "seats_total": 4
  },
  "req_user_data": {
    "name": "Иван",
    "last_name": "Игнатенко",
    "own_region": "Егорьевск",
    "bio": "asdasdasdasdasdadasasdasdasdkjasdhkasdasdasdjasdadsadshaajkasdjkkadj",
    "review": 0
  }
}
```
или так, если запрос отправил водитель (добавляется поле car)
```json
{
  "req_peoples_count": 2,
  "req_carpool": {
    "departure_time": "2021-07-28T12:36:00.000Z",
    "match_id": 1,
    "own_region": "Балашиха",
    "location": "Нефтяники, ул. Малунцева",
    "seats_total": 4
  },
  "req_user_data": {
    "name": "Stas",
    "last_name" :null,
    "own_region": "Видное",
    "bio": null,
    "review": 4.25,
    "car": {
      "name": "Ford Focus",
      "year":2020
    }
  }
}
```

### `message_cancel_request`
```json
{
  "req_peoples_count": 2,
  "req_carpool": {
    "departure_time": "2021-07-28T12:36:00.000Z",
    "match_id": 1,
    "own_region": "Балашиха",
    "location": "Нефтяники, ул. Малунцева",
    "seats_total": 4
  },
  "req_user_data": {
    "name": "Иван",
    "last_name": "Игнатенко",
    "own_region": "Егорьевск",
    "bio": "asdasdasdasdasdadasasdasdasdkjasdhkasdasdasdjasdadsadshaajkasdjkkadj",
    "review": 0
  }
}
```
или так, если запрос отправил водитель (добавляется поле car)
```json
{
  "req_peoples_count": 2,
  "req_carpool": {
    "departure_time": "2021-07-28T12:36:00.000Z",
    "match_id": 1,
    "own_region": "Балашиха",
    "location": "Нефтяники, ул. Малунцева",
    "seats_total": 4
  },
  "req_user_data": {
    "name": "Stas",
    "last_name" :null,
    "own_region": "Видное",
    "bio": null,
    "review": 4.25,
    "car": {
      "name": "Ford Focus",
      "year":2020
    }
  }
}
```