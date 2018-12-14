<template>
    <div class="forum">
        <div class="user-control">
            <h2>Skepdimi</h2>
            <div class="">

            </div>
        </div>
        <div class="forum-content">
            <div class="forum-main">
                <!-- header rendering -->
                <div class="header">
                    <span
                            class="forum-link"
                            v-on:click="backToMainForums"
                    >FORUMS</span>
                </div>

                <!-- container rendering -->
                <div v-if="mainForums.loading" class="mainForums">
                    <span>
                        <ActivityIndicator /> Now loading
                    </span>
                </div>
                <div v-else class="mainForums">
                    <div class="grid">
                        <div v-for="forum in mainForums" :key="forum.title" class="forum-showcase">
                            <h1 class="title">{{ forum.title }}</h1>
                            <p class="description">
                                {{ forum.description }}
                            </p>
                        </div>
                    </div>
                    <div class="selection">
                        <button
                                v-for="forum in mainForums"
                                :key="forum.title"
                                :class="setSelectorClass(forum)"
                        >
                            {{ forum.title }}
                        </button>
                    </div>
                </div>
                <div class="container">
                    <h1>Forums unavailable</h1>
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
                activeForumTitle: 'GrandQuest',
                mainForums: [
                    { title: 'GrandQuest', description: 'The main forum, dedicated to the development of GrandQuest' },
                    { title: 'Art', description: 'Dedicated to the discussion of music, painting, poetry.' },
                    { title: 'General', description: 'A forum for discussing general topics.' },
                ],
                selectedForum: {
                    data: null,
                    loading: false,
                },
                selectedBoard: {
                    data: null,
                    loading: false,
                    topics: [],
                },
                selectedTopic: {
                    data: null,
                },
            };
        },
    })

    export default class Forum extends Vue {
        public backToMainForums() {
            this.$data.selectedForum = {
                data: null,
                loading: false,
            };
        }
        public setSelectorClass(forum: { title: string }) {
            const title = forum.title.toLowerCase().trim();
            let className = title;

            if (this.$data.activeForumTitle.toLowerCase().trim() === title) {
                className += ' active';
            }

            return className;
        }
        public navigateToForum(title: string) {
            api.get(`/forum/${title}`)
                .then((res: ApiResponse<any>) => {
                    const body = res.data;

                    if (res.ok) {
                        this.$data.selectedForum.data = {...body.data};
                    } else {
                        alert('Could not load forum');
                    }

                    this.$data.selectedForum.loading = false;
                });
        }
        private selectedForumRoute() {
            if (this.$data.selectedForum.data.title) {
                return `forum/${this.$data.selectedForum.data.title}`;
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

        .forum-link {
            color: white;
            font-size: large;
        }
        .forum-link:hover {
            color: $mainBlue;
            cursor: pointer;
        }
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
                .mainForums {
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    color: white;
                    padding: 1em;

                    .grid {
                        border-radius: 15px 15px 0 0;
                        display: grid;
                        padding: 10px;
                        grid-gap: 10px;
                        grid-template-columns: auto auto;
                        background: $mainLightGrey;

                        .forum-showcase {
                            padding: 15px;
                            background: #eeeeee;
                            border-radius: 15px;
                            color: $mainBlue;

                            transition: .1s all ease-in-out;
                            .title {
                                font-size: larger;
                                margin: auto auto;
                            }
                        }
                        .forum-showcase:hover {
                            background: white;
                            color: $mainGreen;
                            cursor: pointer;
                        }
                    }
                    .selection {
                        display: flex;
                        flex-direction: row;

                        button {
                            flex: 1;
                            height: 100%;
                            font-weight: bold;
                            color: white;
                            border: none;
                            font-size: large;
                            padding: 1em;
                            box-shadow: inset 2px 2px 3px $mainGrey;
                            &:last-of-type {
                                border-radius: 0 0 5px 0;
                            }
                            &:first-of-type {
                                border-radius: 0 0 0 5px;
                            }
                        }
                        button.grandquest {
                            background: $mainBlue;
                        }
                        button.art {
                            background: $mainGreen;
                        }
                        button.general {
                            background: $mainLightGrey;
                        }

                        button.active {
                            height: inherit;
                            box-shadow: none;
                            border-radius: 0 0 5px 5px;
                        }
                    }
                }
                .mainForums.blue {
                    background: $mainBlue;
                }
                .mainForums.green {
                    background: $mainGreen;
                }

                .boards {
                    color: $mainBlack;
                    padding: 10px;
                    display: grid;
                    grid-gap: 10px;
                    grid-template-columns: auto auto;

                    .main-board-container{
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
                    .forum-showcase {
                        .boards {

                        }
                    }
                }
            }
        }
    }
</style>