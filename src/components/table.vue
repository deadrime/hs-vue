<template>
    <div>
        <div class="card-filters row">
            <div class="col-md-4">
                <h3>Position</h3>
                <select class="form-control custom-select" name="position" v-model="selectedPosition" v-on:click="filterData()">
                    <option value="">All Positions</option>
                    <option>Event</option>
                    <option>Melee</option>
                    <option>Multiple</option>
                    <option>Ranged</option>
                    <option>Siege</option>
                </select>
            </div>
            <div class="col-md-4">
                <h3>Faction</h3>
                <select class="form-control custom-select" name="faction" v-model="selectedFaction" v-on:click="filterData()">
                    <option value="">All Factions</option>
                    <option>Monsters</option>
                    <option>Neutral</option>
                    <option>Nilfgaard</option>
                    <option>Northern Realms</option>
                    <option>Scoia'tael</option>
                    <option>Skellige</option>
                </select>
            </div>

            <div class="col-md-4">
                <h3>Rarity</h3>
                <select class="form-control custom-select" name="rarity" v-model="selectedRarity" v-on:click="filterData()">
                    <option value="">All Rarities</option>
                    <option>Common</option>
                    <option>Epic</option>
                    <option>Legendary</option>
                    <option>Rare</option>
                </select>
            </div>

            <div class="col-md-4">
                <h3>Type</h3>
                <select class="form-control custom-select" name="type" v-model="selectedType">
                    <option value="">All Types</option>
                    <option>Ambush</option>
                    <option>Beast</option>
                    <option>Blue Stripes</option>
                    <option>Construct</option>
                    <option>Cursed</option>
                    <option>Doomed</option>
                    <option>Draconid</option>
                    <option>Dryad</option>
                    <option>Dwarf</option>
                    <option>Elf</option>
                    <option>Insectoid</option>
                    <option>Machine</option>
                    <option>Mage</option>
                    <option>Necrophage</option>
                    <option>Ogroid</option>
                    <option>Regressing</option>
                    <option>Relentless</option>
                    <option>Relict</option>
                    <option>Special</option>
                    <option>Specter</option>
                    <option>Stubborn</option>
                    <option>Vampire</option>
                    <option>Weather</option>
                    <option>Wild Hunt</option>
                    <option>Witcher</option>
                </select>
            </div>

            <div class="col-md-4">
                <h3>Group</h3>
                <select class="form-control custom-select" name="group" v-model="selectedGroup">
                    <option value="">All Groups</option>
                    <option>Bronze</option>
                    <option>Gold</option>
                    <option>Leader</option>
                    <option>Silver</option>
                </select>
            </div>

            <div class="col-md-4">
                <h3>Search</h3>
                <b-form-fieldset>
                    <b-form-input v-model="filter" placeholder="Type to Search"></b-form-input>
                </b-form-fieldset>
            </div>
        </div>

        <div class="card-filters row">
            <div class="col-md-5">
                <b-form-fieldset horizontal label="Rows per page" :label-cols="6">
                    <b-form-select :options="pageOptions" v-model="perPage"></b-form-select>
                </b-form-fieldset>
            </div>

            <div class="col-sm-5">
                <b-pagination :total-rows="totalRows" :per-page="perPage" align="center" v-model="currentPage"></b-pagination>
                <!--<b-pagination-nav v-model="currentPage" :number-of-pages="Math.ceil(totalRows/perPage)"></b-pagination-nav>-->
            </div>

            <div class="col-sm-2 text-md-right">
                <b-button @click="resetFilters">Clear Sort</b-button>
            </div>
        </div>


        <!-- Main table element -->
        <b-table striped responsive hover show-empty
                 :items="filterData()"
                 :fields="fields"
                 :current-page="currentPage"
                 :per-page="perPage"
                 :filter="filter"
                 :sort-by.sync="sortBy"
                 :sort-desc.sync="sortDesc"
                 @filtered="onFiltered"
        >
            <template slot="name" scope="row">
                <a :data-test="row.item.text" :href= "'http://localhost:3000/cards/' + row.item._id">{{row.value}}</a>
            </template>
            <!--<template slot="isActive" scope="row">{{row.value?'Yes :)':'No :('}}</template>-->
            <!--<template slot="actions" scope="row">-->
            <!--&lt;!&ndash; We use click.stop here to prevent a 'row-clicked' event from also happening &ndash;&gt;-->
            <!--<b-btn size="sm" @click.stop="details(row.item,row.index,$event.target)">Details</b-btn>-->
            <!--</template>-->
        </b-table>
        <p>
            Sort By: {{ sortBy || 'n/a' }}, Direction: {{ sortDesc ? 'descending' : 'ascending' }}
        </p>

    </div>
</template>

<script>
    export default {
        name: 'table',
        props: ['pageid'],
        data: function(){
            return {
                items: [],
                fields: {
                    name: {label: 'Name', sortable: true},
                    faction: { label: 'Faction', sortable: true },
                    rarity:  { label: 'Rarity', sortable: true },
                    group: { label: 'Group', sortable: true },
                    strength:  { label: 'Strength', sortable: true },
                    position: { label: 'Position', sortable: true },
                    type: { label: 'Type', sortable: true },
                    loyalty: { label: 'Loyalty', sortable: true }
                },
                currentPage: 1,
                perPage: 30,
                totalRows: 0,
                pageOptions: [{text:10,value:10},{text:20,value:20},{text:30,value:30}],
                sortBy: null,
                sortDesc: false,
                filter: null,
                modalDetails: { index:'', data:'' },
                selectedPosition: '',
                selectedFaction: '',
                selectedType: '',
                selectedRarity: '',
                selectedGroup: ''
            }
        },
        created(){
            this.getCards();
            this.totalRows = this.items.length;
        },
        methods: {
            getCards() {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://localhost:3000/getcards' + '?count='+ 'all' + '&skip=' + 0, true);
                xhr.setRequestHeader('Content-Type','application/json');
                xhr.send();
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        let res = JSON.parse(xhr.responseText);
                        this.items= res['cards'];
                        console.log(this.items);
                    }
                }
            },
            filterData() {
                let params = '?page=' + this.currentPage + '&size=' + this.perPage;
                console.log(params);
                return this.items.filter(card => {
                    if(this.selectedPosition && card['position']!==this.selectedPosition) {
                        return false;
                    }
                    if(this.selectedFaction && card['faction']!==this.selectedFaction) {
                        return false;
                    }
                    if(this.selectedType && card['type']!==this.selectedType) {
                        return false;
                    }
                    if(this.selectedRarity && card['rarity']!==this.selectedRarity) {
                        return false;
                    }
                    if(this.selectedGroup && card['group']!==this.selectedGroup) {
                        return false;
                    }
                    return true;
                });
            },
            resetFilters() {
                this.selectedPosition='';
                this.selectedFaction='';
                this.selectedType='';
                this.selectedRarity='';
                this.selectedGroup='';
                this.sortBy = null;
            },
            details(item, index, button) {
                this.modalDetails.data = JSON.stringify(item, null, 2);
                this.modalDetails.index = index;
                this.$root.$emit('show::modal','modal1', button);
            },
            resetModal() {
                this.modalDetails.data = '';
                this.modalDetails.index = '';
            },
            onFiltered(filteredItems) {
                // Trigger pagination to update the number of buttons/pages due to filtering
                this.totalRows = filteredItems.length;
                this.currentPage = parseInt(this.pageid) || 1;
            }
        }
    }
</script>