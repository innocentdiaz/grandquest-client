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
                    >FORUMS / </span>
                    <span class="forum-link">
                        {{selectedForum().title}}
                    </span>
                </div>

                <!-- container rendering -->
                <div
                        v-if="selectedBoard"
                        class="mainBoard"
                >
                    <span class="forum-link back" v-on:click="() => setForum(0)">
                        Back to {{selectedForum().title}}
                    </span>

                    <h1>{{ selectedBoard.title }}</h1>
                    <span>{{ selectedBoard.description }}</span>
                </div>
                <div
                        v-else
                        class="mainForums"
                >
                    <div :class="setShowcaseClass()">
                        <div
                             class="forum-showcase"
                             v-for="board in selectedForum().boards"
                             :key="board.id"
                        >
                            <div
                                v-on:click="() => setBoard(board)"
                            >
                                <h1 class="title">{{ board.title }}</h1>
                                <p class="description">
                                    {{ board.description }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="selection">
                        <button
                                v-for="(forum, index) in mainForums"
                                :key="forum.title"
                                :class="setSelectorClass(forum)"
                                v-on:click="() => setForum(index)"
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
    import ActivityIndicator from '@/components/ActivityIndicator.vue';

    @Component({
        components: { ActivityIndicator },
        data() {
            return {
                currentForumIndex: 0,
                mainForums: [
                    {
                        title: 'GrandQuest',
                        description: 'The main forum, dedicated to the development of GrandQuest',
                        boards: [
                            {
                                id: 1,
                                title: 'Announcements',
                                description: `
                                        Welcome to the GrandQuest announcements!
                                        We regularly update you on the occurrences in our world here
                                    `,
                            },
                            {
                                id: 2,
                                title: 'Bug Reporting',
                                description: 'Find bugs and report them to us so we can remove them!',
                            },
                        ],
                    },
                    { title: 'Art', description: 'Dedicated to the discussion of music, painting, poetry.', boards: [] },
                    { title: 'General', description: 'A forum for discussing general topics.', boards: [] },
                ],
                selectedBoard: null,
                selectedTopic: {
                    data: null,
                },
            };
        },
    })

    export default class Forum extends Vue {
        public selectedForum() {
            const index = this.$data.currentForumIndex;
            return this.$data.mainForums[index];
        }
        public setForum(index: number) {
            this.$data.selectedBoard = null;
            this.$data.currentForumIndex = index;
        }
        public setBoard(board: { id: number, title: string, description: string }) {
            this.$data.selectedBoard = board
        }
        public setShowcaseClass() {
            const selectedForum = this.$data.mainForums[this.$data.currentForumIndex];
            const title = selectedForum.title.toLowerCase().trim();

            return 'grid ' + title;
        }
        public setSelectorClass(forum: { title: string }) {
            const title = forum.title.toLowerCase().trim();
            const selectedForum = this.$data.mainForums[this.$data.currentForumIndex];
            let className = title;

            if (selectedForum.title.toLowerCase().trim() === title) {
                className += ' active';
            }

            return className;
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
            font-size: large;
        }
        .forum-link.back {
            background-color: $mainLightGrey;
            padding: .5em;
            border-radius: 15px;
            margin-bottom: 2em;
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
                        min-height: 150px;
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
                        align-items: stretch;

                        button {
                            flex: 1;
                            cursor: pointer;
                            font-weight: bold;
                            color: white;
                            border: none;
                            font-size: large;
                            padding: 1em;
                            box-shadow: inset 2px 2px 3px #3c3c3c;
                            margin-bottom: 10px;

                            transition: .2s all ease-in-out;

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
                            margin-bottom: 0;
                        }
                    }
                    .grid.grandquest {
                        background: $mainBlue;
                    }
                    .grid.art {
                        background: $mainGreen;
                    }
                }
                .mainBoard {
                    padding: 1em;
                    color: $mainBlack;
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