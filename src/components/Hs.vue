<template>
  <div class="hs-app">
    <div class="content">
      <!-- Выбор класса -->
      <el-row class="row">
        <el-radio-group v-model="selectedClass" size="small">
          <el-radio-button
            v-for="(key, title) in classes" 
            :key="key"
            :label="title"
          />
        </el-radio-group>
      </el-row>
      <!-- Выбор приключения -->
      <el-row class="row">
        <el-select
          size="small"
          v-model="selectedAdventure"
          filterable 
          multiple
          class="select"
          placeholder="Pick adventures">
          <el-option
            v-for="item in adventures"
            :key="item"
            :label="item"
            :value="item">
            {{item}}
          </el-option>
        </el-select>
      </el-row>
      <!-- Выбор механик -->
      <el-row class="row">
        <el-select
          size="small"
          class="select"
          v-model="selectedMechanics"
          filterable 
          multiple
          placeholder="Pick mechanics">
          <el-option
            v-for="item in mechanics"
            :key="item"
            :label="item"
            :value="item">
            {{item}}
          </el-option>
        </el-select>
      </el-row>
      <!-- Выбор рассы -->
      <el-row class="row">
        <el-select
          size="small"
          class="select"
          v-model="selectedRaces"
          filterable 
          multiple
          placeholder="Pick races">
          <el-option
            v-for="item in races"
            :key="item"
            :label="item"
            :value="item">
            {{item}}
          </el-option>
        </el-select>
      </el-row>
      <!-- Поиск -->
      <el-row class="row">
        <el-input placeholder="Search" v-model="searchStr" class="input-with-select select" size="small">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
        </el-row>
      <!-- Сортировка -->
      <el-row class="row sorting">
        <span>Sort by </span>
        <el-radio-group v-model="sortBy" size="mini">
          <el-radio label="cost" border>cost</el-radio>
          <el-radio label="name" border>name</el-radio>
        </el-radio-group>
        <el-switch v-model="sortDesc" 
          active-text="Desc"
          inactive-text="Asc"/>
        <el-button type="danger" size="small">Reset</el-button>
      </el-row>
      <!-- Картонки -->
      <el-row class="row">
        <div 
          class="cards-list"
          v-loading="!isLoaded"
          ref="cards"
          element-loading-text="Loading...">
          <progressive-background
            v-for="card in displayCards()"
            :key="card.cardId"
            @click.native="pickCard(card)"
            class="single-card"
            :src="card.img" />
        </div>
        <el-pagination
          v-if="totalRows"
          layout="prev, pager, next"
          :current-page.sync="currentPage"
          :page-size="perPage"
          :total="totalRows"/>
      </el-row>
    </div>
    <!-- Конструктор колоды -->
    <aside class="deck-left" v-if="pickedCardsCount > 0">
      <ul class="deck-list">
        <li class="deck-card" v-for="card in displayPickedCards" :key="card.id" @click="deleteCard(card)">
          <div class="deck-card-cost"><span>{{card.cost}}</span></div>
          <div class="blur"></div>
          <div class="deck-card-face" :style="'background-image: url(' + card.img + ')'">
              <span :class="[card.rarity]" data-card="KAR_009">{{card.name}}</span>
          </div>
          <div :class="['deck-card-count',card.rarity]"><span>{{card.rarity === 'Legendary' ? '★' : card.count}}</span>
          </div>
        </li>
      </ul>
      <el-button :disabled="pickedCardsCount !== 30" @click="generateDeckCode">
        Copy deck
      </el-button>
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
    Multiselect
  },
  name: 'hs',
  data() {
    return {
      cards: [], //карты
      heroes: [], //герои
      classes: {
        //Классы и их коды для генерации колоды
        Druid: 274,
        Hunter: 31,
        Mage: 637,
        Paladin: 671,
        Priest: 813,
        Rogue: 930,
        Shaman: 1066,
        Warlock: 893,
        Warrior: 7
      },
      selectedClass: 'Druid', //Выбранный класс
      races: [], //рассы
      adventures: [], //приключения
      mechanics: [], //механики
      // Для сортировки
      selectedAdventure: [], //Выбранные приключения
      selectedRaces: [], //Выбранные рассы
      selectedHero: '', //Выбранный герой
      selectedRariry: '', //Выбранная редкость карт
      selectedMechanics: [], //Выбранные механики

      dustCost: 0, //TODO - общая стоимость колоды
      manaCost: 0, //TODO - сортировка по мане + график
      manaData: [0, 1, 2, 3, 4, 5, 6, 7, 8, '9+'],
      sortBy: 'cost', //тип сортировки - по мане или по алфавиту
      sortDesc: false, // по возрастанию или по убыванию
      searchStr: '',

      isLoaded: false, //Загружены ли все карты
      totalRows: 0, //Всего карт
      currentPage: 1,
      perPage: 16,
      pickedCards: {}, //Выбранные карты
      pickedCardsCount: 0 //Количество выбранных карт
    }
  },
  computed: {
    displayPickedCards() {
      // Вывод выбранных карт, отсортированных по стоимости TODO - проверить, такая же сортировка в самой игре
      let result = Object.values(this.pickedCards)
      console.log(result)
      return result.sort(function compare(a, b) {
        if (a.cost < b.cost) return -1
        if (a.cost > b.cost) return 1
        return 0
      })
    }
  },
  created() {
    this.getCards() // получение всех карт при созлании экземпляра vue
    window.addEventListener('resize', this.handleResize)
  },
  watch: {
    // Отслеживание изменений значения
    searchStr(val) {
      this.displayCards()
      this.currentPage = 1
    },
    selectedAdventure() {
      this.displayCards()
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleSelectClass(e) {
      //изменение текущего класса на основе value у button
      this.pickedCards = {} //обнуление текущей колоды
      this.pickedCardsCount = 0
      let newClass = e.target.value
      if (this.selectedClass === newClass) {
        // Можно тоглить все карты/ карты выбранного класса
        this.selectedClass = ''
      } else {
        this.selectedClass = newClass // или просто выбрать новый класс
      }
    },
    toggleClassActive(currentClass) {
      // Да, нужна долбанная функция для того, чтобы просто затоглить класс
      if (this.selectedClass === currentClass) {
        return ['active']
      }
    },
    changeSortBy(e) {
      // изменение типа сортировки - cost или name, по убыванию или по возрастанию
      let newSortBy = e.target.value
      if (this.sortBy === newSortBy) {
        this.sortDesc = !this.sortDesc
      } else {
        this.sortBy = newSortBy
      }
    },
    toggleSortByClass(type) {
      if (this.sortBy === type && !this.sortDesc) {
        return ['asc', 'active']
      }
    },
    pickCard(card) {
      // добавление карты в колоду
      console.log(card)
      if (this.pickedCardsCount >= 30) return
      const id = parseInt(card.dbfId)
      let newCard = {
        ...card,
        count: 1,
        dbfId: id
      }
      if (id in this.pickedCards) {
        // Есть ли карта в колоде
        if (card.rarity === 'Legendary') return //Лега может быть только 1
        if (this.pickedCards[id].count < 2) {
          //если всего 1 карта - то увеличиваем счетчик
          this.pickedCardsCount++
        }
        newCard.count = 2
        this.$set(this.pickedCards, id, newCard)
      } else {
        // Если карты нет - добавляем
        this.pickedCardsCount++
        this.$set(this.pickedCards, id, newCard)
      }
    },
    deleteCard(card) {
      // Удаление карты TODO - сделать отмену действий
      this.pickedCardsCount--
      if (card.count === 2) {
        card.count = 1
        this.$set(this.pickedCards, card.dbfId, card)
      } else {
        this.$delete(this.pickedCards, card.dbfId)
      }
    },
    generateDeckCode() {
      //Генерация кода колоды для импорта в игру
      let cards = []
      for (let card in this.pickedCards) {
        cards.push([parseInt(card), this.pickedCards[card]['count']])
      }
      const deck = {
        cards, // массив из пар [dbfid, count]
        heroes: [this.classes[this.selectedClass]], //dbfid героя
        format: 1 // 1 for Wild, 2 for Standard
      }
      const deckstring = encode(deck)
      const copyToClipboard = str => {
        const el = document.createElement('textarea')
        el.value = str
        el.setAttribute('readonly', '')
        el.style.position = 'absolute'
        el.style.left = '-9999px'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      copyToClipboard(deckstring)
    },
    async getCards() {
      // получение карт с api хса
      const url =
        'https://omgvamp-hearthstone-v1.p.mashape.com/cards?collectible=1' //&locale=ruRU TODO - найти или сделать API с поддержкой русского языка
      const apiKey = 'xQcf9pl5TYmshn44pN9QKpTzKDTdp18bu9GjsnXmJBRcQLWbJJ'

      const headers = new Headers({
        'Content-Type': 'application/json',
        'X-Mashape-Key': apiKey
      })

      const settings = {
        headers,
        method: 'GET',
        mode: 'cors',
        cache: 'default'
      }

      const resp = await fetch(url, settings).then(r => r.json())

      for (let adv in resp) {
        if (resp[adv].length > 0) {
          if (adv !== 'Hero Skins') {
            // Добавление приключений
            this.adventures.push(adv)
          }
          for (let card of resp[adv]) {
            if (card.type === 'Hero' && !this.heroes.includes(card)) {
              // Если это карта героя
              this.heroes.push(card) // Добавление героев TODO - возможность выбора не только класса но и героя
            } else {
              //если обычная карта
              if ('race' in card) {
                if (!this.races.includes(card.race)) {
                  // TODO - объединить эти if
                  this.races.push(card.race)
                }
              }
              if ('mechanics' in card) {
                for (let mechanic of card['mechanics']) {
                  // TODO - потестить через card['mechanics'].some(m => {})
                  if (!this.mechanics.includes(mechanic.name)) {
                    this.mechanics.push(mechanic.name)
                  }
                }
              }
              this.cards.push(card) //наконец просто добавляем карту
            }
          }
        }
      }
      this.totalRows = this.cards.length // всего карт
      this.mechanics = this.mechanics.sort() // сортируем механики по алфавиту
      this.isLoaded = true // загрузилось

      this.$nextTick(function () {
        this.handleResize()
      })
    },
    handleResize() {
      const cardsW = this.$refs.cards.clientWidth
      const cardW = this.$refs.cards.children[1].clientWidth
      const cardsInRow = Math.floor(cardsW/cardW)
      this.perPage = cardsInRow * Math.round(this.perPage/cardsInRow)
      this.displayCards()
    },
    displayCards() {
      // Главный говнокод - сортировка карт
      let result = [] // это мы вернем
      let start = (this.currentPage - 1) * this.perPage // начиная откуда выводим
      let end = start + this.perPage // где заканчиваем
      result = this.cards.filter(card => {
        let name = card['name'].toLowerCase()
        let text = card['text'] ? card['text'].toLowerCase() : ''
        let cardClass = card['playerClass'] || ''
        let search = this.searchStr.toLowerCase()
        // TODO - попробовать сократить количество if
        if (
          this.searchStr &&
          name.indexOf(search) === -1 &&
          text.indexOf(search) === -1
        ) {
          return false
        }
        if (this.selectedClass && cardClass !== this.selectedClass) {
          return false
        }
        if (
          this.selectedAdventure.length > 0 &&
          !this.selectedAdventure.includes(card['cardSet'])
        ) {
          return false
        }
        if (this.selectedMechanics.length > 0 && !card['mechanics']) {
          //Вот с этим точно можно что-то сделапть
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
      result = result.sort(function compare(a, b) {
        if (a[key] < b[key]) return -1 * reverse
        if (a[key] > b[key]) return reverse
        return 0
      })
      this.totalRows = result.length //обновляем количество карт
      return result.slice(start, end) // пагинация
    }
  }
}
</script>
<style>
.hs-app {
  display: flex;
}

.content {
  flex: 1;
}

.deck-left {
  min-width: 320px;
}

.select {
  width: 100%;
  margin-top: 0.4em;
  margin-bottom: 0.4em;
}
.sorting {
  margin-top: 0.5rem;
}
.sorting > * {
  margin: 0 0.5rem;
  font-size: 14px;
}

.cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 16px;
  min-height: 200px;
}

.single-card {
  min-height: 300px;
  background-size: auto 100%;
  background-position: center;
  background-repeat: no-repeat;
  height: 330px;
}

.deck-card {
  display: flex;
  flex-direction: row;
  position: relative;
  height: 40px;
  border-bottom: 1px solid #000;
}
.deck-card:before {
  content: "";
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  background: linear-gradient(
    to right,
    #282828 25%,
    rgba(120, 120, 120, 0) 80%
  );
  top: 0;
  z-index: 10;
}
.deck-card:hover::before {
  background: linear-gradient(
    to right,
    #505050 20%,
    rgba(120, 120, 120, 0) 80%
  );
}
.deck-card-cost {
  display: flex;
  z-index: 11;
  align-items: center;
  justify-content: center;
  background: #104e80;
  font-weight: 900;
  color: #fff;
  padding: 10px 0;
  width: 34px;
  border-right: solid 1px #000;
  box-sizing: border-box;
  text-align: center;
  text-shadow: 1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000;
}
.deck-card-cost:before {
  content: attr(data-cost);
  font-weight: 900;
  text-shadow: 0 0 2px #000;
}
.deck-card-face {
  background-color: #1b120d;
  background-position: -20% 28%;
  background-size: 125%;
  flex: 1;
  position: relative;
}
.deck-card-face span {
  position: relative;
  display: block;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  font-size: 14px;
  z-index: 11;
  font-weight: 900;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
}
.deck-card-count {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #331504;
  padding: 10px 0;
  width: 34px;
  text-align: center;
  box-sizing: border-box;
  z-index: 12;
}
.deck-card-count span {
  color: #fff60a;
  font-weight: 900;
  text-shadow: 0 0 2px #000;
}
.deck-card-count.Legendary {
  box-shadow: -6px 0px #ff8f08;
}
.deck-card-count.common {
  box-shadow: -6px 0px #838383;
}
.deck-card-count.rare {
  box-shadow: -6px 0px #0763ae;
}
.deck-card-count.epic {
  box-shadow: -6px 0px #7b28b3;
}
</style>
