<template>
    <div class="forum">
        <div class="user-control">
            <h2>Skepdimi</h2>
            <div class="">

            </div>
        </div>
        <div class="forum-content">
            <div class="forum-main">
                <div class="header">
                    <router-link to="/forum">FORUMS</router-link> /
                    <router-link v-if="selectedForum.title" to="selectedForumRoute">{{selectedForum.title}}</router-link>
                </div>
                <div v-if="mainForums.loading" class="container">
                    <span>
                        <ActivityIndicator /> Now loading
                    </span>
                </div>
                <div class="container">
                    <div v-for="forum in mainForums.data" :key="forum.title" class="main-forum-container" v-on:click="navigateToForum(forum.title)">
                        <h1 class="title">{{ forum.title }}</h1>
                        <p class="description">
                            {{ forum.description }}
                        </p>
                        <ul class="tags">
                            <li>#computers</li>
                            <li>#some</li>
                            <li>#tags</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { ApiResponse } from 'apisauce';
    import api from '../api';
    import ActivityIndicator from '@/components/ActivityIndicator.vue';

    @Component({
        components: { ActivityIndicator },
        mounted() {
            api.get('/forum')
                .then((res: ApiResponse<any>) => {
                    const body = res.data;

                    if (res.ok) {
                        this.$data.mainForums.data = [...body.data];
                    } else {
                        alert(body ? body.message : 'Failed to load forums');
                    }

                    this.$data.mainForums.loading = false;
                });
        },
        data() {
            return {
                mainForums: {
                    data: [],
                    loading: true,
                },
                selectedForum: {
                    title: null,
                    loading: false,
                },
            };
        },
    })

    export default class Forum extends Vue {
        private navigateToForum(title: string) {
            api.get(`/forum/${title}`)
                .then((res: ApiResponse<any>) => {
                    const body = res.data;

                    if (res.ok) {
                        this.$data.selectedForum = {...body.data};
                    } else {
                        alert('Could not load forum');
                    }

                    this.$data.selectedForum.loading = false;
                });
        }
        private selectedForumRoute() {
            if (this.$data.selectedForum.title) {
                return `forum/${this.$data.selectedForum.title}`;
            }
        }
    }
</script>

<style lang="scss">
    $mainBlue: #036ca5;
    $mainBlack: rgb(24, 24, 24);
    $mainGrey: rgb(179, 179, 179);
    $mainGreen: #9dff5c;
    $mainLightGrey: #e0e0e0;

    .forum  {
        height: 100%;
        background: $mainGrey;
        padding: 1em 2em;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;

        .user-control {
            flex: 1;
            margin-right: 2em;
            padding: 12px;

            border-radius: 10px;
            background: $mainGreen;
            color: white;
            min-height: 150px;

            h2 {
                margin: 5px;
            }
        }
        .forum-content {
            flex: 3;
            align-self: stretch;

            .forum-main {
                border-radius: 10px;
                overflow: hidden;
                background: white;
                color: white;
                height: 100%;

                .header {
                    background: $mainBlack;
                    font-size: large;
                    padding: 12px;

                    a {
                        color: white;
                        text-decoration: none;
                    }
                    a:hover {
                        color: $mainGrey;
                    }
                }
                .container {
                    padding: 10px;
                    display: grid;
                    grid-gap: 10px;
                    grid-template-columns: auto auto;

                    .main-forum-container {
                        border-radius: 15px;
                        padding: 8px 8px 12px 8px;
                        background: $mainLightGrey;
                        color: $mainBlack;

                        cursor: pointer;
                        user-select: none;

                        transition: .2s all ease-in-out;
                        .title {
                            margin: 10px 0;
                            font-size: large;
                            font-weight: lighter;
                        }
                        .description {

                        }
                        .tags {
                            padding: 0;
                            margin: 0;
                            color: $mainGrey;
                            li {
                                list-style: none;
                                display: inline;
                                margin-right: 5px;
                            }
                        }
                    }
                    .main-forum-container:hover {
                        opacity: 0.7;
                        .title {
                            color: $mainBlue;
                        }
                    }
                }
            }
        }
    }
</style>