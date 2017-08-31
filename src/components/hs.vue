<template>
    <div id="full-app">
        <div id="hs">
            <div class="classes">
                <button v-for="(item, key) in classes" :value="key" @click="classSelect"
                        :class="[toggleClassActive(key),'classes-list-item']">{{ key }}
                </button>
            </div>

            <div>
                <label class="typo__label">Adventures</label>
                <multiselect v-model="selectedAdventure" :options="adventures" :multiple="true"
                             :close-on-select="true" :clear-on-select="false" :hide-selected="true"
                             :preserve-search="true" placeholder="Pick adventures" selectLabel="">
                    <template slot="tag" scope="props"><span class="multiselect__tag">
                        <span>{{ props.option }}</span>
                            <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @click="props.remove(props.option)"></i>
                        </span>
                    </template>
                </multiselect>
            </div>

            <div>
                <label>Mechanics</label>
                <multiselect v-model="selectedMechanics" :options="mechanics" :multiple="true"
                             :close-on-select="true" :clear-on-select="false" :hide-selected="true"
                             :preserve-search="true" placeholder="Pick mechanics" selectLabel="">
                    <template slot="tag" scope="props"><span class="multiselect__tag">
                        <span>{{ props.option }}</span>
                            <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @click="props.remove(props.option)"></i>
                        </span>
                    </template>
                </multiselect>
            </div>

            <div>
                <label class="typo__label">Races</label>
                <multiselect v-model="selectedRaces" :options="races" :multiple="true" :close-on-select="true"
                             :clear-on-select="false" :hide-selected="true" :preserve-search="true"
                             placeholder="Pick races" selectLabel="" :taggable="true">
                    <template slot="tag" scope="props"><span class="multiselect__tag">
                        <span>{{ props.option }}</span>
                            <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @click="props.remove(props.option)"></i>
                        </span>
                    </template>
                </multiselect>
            </div>


            <div class="row sort-settings">
                <div class="col-md-8">
                    <b-form-input v-model="searchStr"
                                  type="text"
                                  placeholder="Search"
                                  :formatter="format"
                                  lazy-formatter>
                    </b-form-input>
                </div>

                <div class="col-md-4 sortby">
                    <span>Sort by </span>
                    <button value="cost" class="btn btn-secondary dropdown-toggle" @click="changeSortBy" :class="toggleSortByClass('cost')">Cost</button>
                    <button value="name" class="btn btn-secondary dropdown-toggle" @click="changeSortBy" :class="toggleSortByClass('name')">Name</button>
                </div>
            </div>

            <b-button variant="danger" class="reset-btn">Reset</b-button>
            <transition name="fade">
                <div class="data-loarder" v-if="!isLoaded">
                    <vue-loading spinner="three-bounce"></vue-loading>
                </div>
            </transition>
            <transition name="fade" mode="out-in">
                <div class="loading-data" v-if="isLoaded">
                    <transition-group name="cards" tag="div" class="cards">
                        <div v-for="card in displayCards()" @click="pickCard(card)" class="single-card"
                             v-bind:key="card.cardId">
                            <img :src="card.img" alt="">
                        </div>
                    </transition-group>
                    <b-pagination :total-rows="totalRows" :per-page="perPage" align="center" v-model="currentPage"
                                  v-if="totalRows > perPage"></b-pagination>
                </div>
            </transition>
        </div>

        <aside class="deck-left" v-if="pickedCardsCount > 0">
            <ul class="deck-list">
                <li class="deck-card" v-for="card in displayPickedCards()" @click="deleteCard(card)">
                    <div class="deck-card-cost"><span>{{card.cost}}</span></div>
                    <div class="blur"></div>
                    <div class="deck-card-face" :style="'background-image: url(' + card.img + ')'">
                        <span :class="[card.rarity]" data-card="KAR_009">{{card.name}}</span>
                    </div>
                    <div :class="['deck-card-count',card.rarity]"><span>{{card.rarity === 'Legendary' ? '★' : card.count}}</span>
                    </div>
                </li>
            </ul>
            <button :disabled="pickedCardsCount !== 30" @click="generateDeckCode()">Copy deck</button>
        </aside>
    </div>


</template>

<script>
  import VueLoading from 'vue-simple-loading'
  import Multiselect from 'vue-multiselect'
  import { encode, decode } from 'deckstrings'

  export default {
    components: {
      VueLoading,
      Multiselect,
    },
    name: 'hs',
    data () {
      return {
        cards: [], //карты
        heroes: [], //герои
        classes: { //Классы и их коды для генерации колоды
          'Druid': 274,
          'Hunter': 31,
          'Mage': 637,
          'Paladin': 671,
          'Priest': 813,
          'Rogue': 930,
          'Shaman': 1066,
          'Warlock': 893,
          'Warrior': 7
        },
        races: [], //рассы
        adventures: [], //приключения
        mechanics: [], //механики
        // Для сортировки
        selectedAdventure: [], //Выбранные приключения
        selectedRaces: [], //Выбранные рассы
        selectedHero: '', //Выбранный герой
        selectedRariry: '', //Выбранная редкость карт
        selectedMechanics: [], //Выбранные механики
        selectedClass: 'Druid', //Выбранный класс
        dustCost: 0, //TODO - общая стоимость колоды
        manaCost: 0, //TODO - сортировка по мане + график
        manaData: [0, 1, 2, 3, 4, 5, 6, 7, 8, '9+'],
        sortBy: 'cost', //тип сортировки - по мане или по алфавиту
        sortDesc: false, // по возрастанию или по убыванию
        searchStr: '',

        isLoaded: false, //Загружены ли все карты
        totalRows: 0, //Всего карт
        currentPage: 1,//Ты не Настя
        perPage: 16, //Ты не Настя
        pickedCards: {}, //Выбранные карты
        pickedCardsCount: 0 //Количество выбранных карт
      }
    },
    created () {
      this.getCards() // получение всех карт при созлании экземпляра vue
    },
    watch: { // Отслеживание изменений значения
      searchStr: function (val) {
        this.displayCards()
        this.currentPage = 1
      },
      selectedAdventure: function () {
        this.displayCards()
      }
    },
    methods: {
      classSelect (e) { //изменение текущего класса на основе value у button
        this.pickedCards = {} //обнуление текущей колоды
        this.pickedCardsCount = 0
        let newClass = e.target.value
        if (this.selectedClass === newClass) { // Можно тоглить все карты/ карты выбранного класса
          this.selectedClass = ''
        }
        else {
          this.selectedClass = newClass // или просто выбрать новый класс
        }
      },
      toggleClassActive (currentClass) { // Да, нужна долбанная функция для того, чтобы просто затоглить класс
        if (this.selectedClass === currentClass) {
          return ['active']
        }
      },
      changeSortBy (e) { // изменение типа сортировки - cost или name, по убыванию или по возрастанию
        let newSortBy = e.target.value
        if (this.sortBy === newSortBy) {
          this.sortDesc = !this.sortDesc
        }
        else {
          this.sortBy = newSortBy
        }
      },
      toggleSortByClass(type){
        if (this.sortBy === type && !this.sortDesc) {
          return ['asc','active']
        }
      },
      pickCard (card) { // добавление карты в колоду
        console.log(card)
        if (this.pickedCardsCount >=30) return

        let id = parseInt(card.dbfId)
        let newCard = {} // так как в js не особо удобная работа с массивами - пришлось сделать в виде объекта, где ключ - числовой id, а значение - объект с характеристиками
        newCard.count = 1
        newCard.name = card.name
        newCard.cardId = card.cardId
        newCard.dbfId = id //TODO - убрать дублирование, сделать обход с помощью (cardId,key) in
        newCard.cost = card.cost
        newCard.rarity = card.rarity
        newCard.img = card.img

        if (id in this.pickedCards) { // Есть ли карта в колоде
          if (card.rarity === 'Legendary') return //Лега может быть только 1
          if (this.pickedCards[id].count<2) { //если всего 1 карта - то увеличиваем счетчик
            this.pickedCardsCount++
          }
          newCard.count = 2
          this.$set(this.pickedCards, id, newCard) // метод vue для реактивного изменение объекта
        }
        else { // Если карты нет - добавляем
          this.pickedCardsCount++
          this.$set(this.pickedCards, id, newCard)
        }
      },
      deleteCard (card) { // Удаление карты TODO - сделать отмену действий
        this.pickedCardsCount--
        if (card.count === 2) {
          card.count = 1
          this.$set(this.pickedCards, card.dbfId, card)
        }
        else {
          this.$delete(this.pickedCards, card.dbfId)
        }
      },
      displayPickedCards () { // Вывод выбранных карт, отсортированных по стоимости TODO - проверить, такая же сортировка в самой игре
        let result = Object.values(this.pickedCards)
        return result.sort(function compare (a, b) {
          if (a.cost < b.cost)
            return -1
          if (a.cost > b.cost)
            return 1
          return 0
        })
      },
      generateDeckCode() { //Генерация кода колоды для импорта в игру
        let cards = []
        for (let card in this.pickedCards) {
          cards.push([parseInt(card),this.pickedCards[card]['count']])
        }
        const deck = {
          cards: cards, // массив из пар [dbfid, count]
          heroes: [this.classes[this.selectedClass]], //dbfid героя
          format: 1, // 1 for Wild, 2 for Standard
        };
        console.log(deck)
        const deckstring = encode(deck);
        console.log(deckstring);
      },
      getCards () { // получение карт с api хса
        const url = 'https://omgvamp-hearthstone-v1.p.mashape.com/cards?collectible=1'//&locale=ruRU TODO - найти или сделать API с поддержкой русского языка
        const apiKey = 'xQcf9pl5TYmshn44pN9QKpTzKDTdp18bu9GjsnXmJBRcQLWbJJ'
        let xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader('X-Mashape-Key', apiKey)
        xhr.send()
        xhr.onload = () => {
          if (xhr.status === 502 || xhr.status === 500) { // Повторить запрос если сервер тупит
            return setTimeout(function () {
              this.getCards()
            }, 1000)
          }
          if (xhr.status === 200) {
            let resp = JSON.parse(xhr.responseText)
            for (let adv in resp) {
              if (resp[adv].length > 0) {
                if (adv !== 'Hero Skins') { // Добавление приключений
                  this.adventures.push(adv)
                }
                for (let card of resp[adv]) {
                  if (card.type === 'Hero' && !this.heroes.includes(card)) { // Если это карта героя
                    this.heroes.push(card) // Добавление героев TODO - возможность выбора не только класса но и героя
                  }
                  else { //если обычная карта
                    if ('race' in card) {
                      if (!this.races.includes(card.race)) { // TODO - объединить эти if
                        this.races.push(card.race)
                      }
                    }
                    if ('mechanics' in card) {
                      for (let mechanic of card['mechanics']) { // TODO - потестить через card['mechanics'].some(m => {})
                        if (!this.mechanics.includes(mechanic.name)) {
                          this.mechanics.push(mechanic.name)
                        }
                      }
                    }
                    this.cards.push(card) //наконец просдо добавляем карту
                  }
                }
              }
            }
            this.totalRows = this.cards.length // всего карт
            this.mechanics = this.mechanics.sort() // сортируем механики по алфавиту
            this.isLoaded = true // загрузилось
          }
        }
      },
      displayCards () { // Главный говнокод - сортировка карт
        let result = [] // это мы вернем
        let start = (this.currentPage - 1) * this.perPage // начиная откуда выводим
        let end = start + this.perPage // где заканчиваем
        result = this.cards.filter(card => {
          let name = card['name'].toLowerCase()
          let text = card['text'] ? card['text'].toLowerCase() : ''
          let cardClass = card['playerClass'] || ''
          let search = this.searchStr.toLowerCase()
          // TODO - попробовать сократить количество if
          if (this.searchStr && name.indexOf(search) === -1 && text.indexOf(search) === -1) {
            return false
          }
          if (this.selectedClass && cardClass !== this.selectedClass) {
            return false
          }
          if (this.selectedAdventure.length > 0 && !this.selectedAdventure.includes(card['cardSet'])) {
            return false
          }
          if (this.selectedMechanics.length > 0 && !card['mechanics']) { //Вот с этим точно можно что-то сделапть
            return false
          }
          if (this.selectedMechanics.length > 0 && card['mechanics']) {
            let finded = false
            for (let mechanic of card['mechanics']) {
              if (this.selectedMechanics.includes(mechanic.name)) {
                finded = true
              }
            }
            if (!finded) {
              return false
            }
          }
          if (this.selectedRaces.length > 0 && !card.race) {
            return false
          }
          if (this.selectedRaces.length > 0 && card.race) {
            if (!this.selectedRaces.includes(card.race)) {
              return false
            }
          }
          return true
        })
        let key = this.sortBy // тип - cost или name
        let reverse = this.sortDesc ? -1 : 1 // порядок
        result = result.sort(function compare (a, b) {
          if (a[key] < b[key])
            return -1 * reverse
          if (a[key] > b[key])
            return reverse
          return 0
        })
        this.totalRows = result.length //обновляем количество карт
        return result.slice(start, end) // пагинация
      }
    }

  }
</script>
<style>
    /* TODO - разобраться с анимациями в VUE */
    .fade-enter-active, .fade-leave-active {
        transition: opacity .7s
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */
    {
        opacity: 0
    }

    .card-item {
        display: inline-block;
        margin-right: 10px;
    }

    .card-enter-active, .card-leave-active {
        transition: all 1s;
    }

    .card-enter, card-leave-to /* .list-leave-active до версии 2.1.8 */
    {
        opacity: 0;
        transform: translateY(30px);
    }
</style>
