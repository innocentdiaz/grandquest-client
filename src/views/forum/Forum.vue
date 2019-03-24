<template>
    <div class="forum">
        <div class="control">
            <div class='control-head'>
                <img src="@/assets/img/icon/grandquest.png" />
                <p class="subtitle" v-if="socket.connected">It's {{timeOfDay}} in the world!</p>
                <p class="subtitle" v-else>You don't appear to be connected to the server.</p>
                <hr/>
                <div class="player-showcase framed" v-if="socket.connected">
                    <div class="player" v-for="user in world.connectedUsers" :key="user.id">
                        <img src="@/assets/img/icon/gq.png" class="thumbnail">
                        <div class="content">
                            <p class="title">{{user.username}}</p>
                            <p class="subtitle">joined {{sinceDate(user.createdAt)}}</p>
                        </div>
                    </div>
                </div>
                <p class="subtitle">Players currently online</p>
            </div>
            <iframe 
                src="https://discordapp.com/widget?id=557628151837229074&theme=dark" 
                height="500" 
                allowtransparency="true" 
                frameborder="0"></iframe>
        </div>

        <div class="forum-content">
            <div class="forum-main">
                <!-- header rendering -->
                <div class="header">
                    <span>
                        FORUMS - {{selectedForum().title}}
                    </span>
                </div>

                <div class="mainForums">
                    <div :class="setShowcaseClass()">
                        <div
                             class="forum-showcase"
                             v-for="board in selectedForum().boards"
                             :key="board.id"
                             v-on:click="() => setBoard(board)"
                        >
                            <div>
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
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { State, Getter } from 'vuex-class';
    import { User, World, SocketState } from '../../types';
    import moment from 'moment';
    import UserControl from '@/components/UserControl.vue';
    import ActivityIndicator from '../../components/ActivityIndicator.vue';

    @Component({
        components: { ActivityIndicator, UserControl },
    })

    export default class Forum extends Vue {
        @State public socket!: SocketState;
        @State public user!: User;
        @State public world!: World;

        public currentForumIndex = 0;
        public mainForums = [
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
            {
                title: 'Art',
                description: 'Dedicated to the discussion of music, painting, poetry.',
                boards: [
                    {
                        id: 3,
                        title: 'Music',
                        description: `
                            A board for the appreciation of music and music theory
                        `,
                    }
                ]
            },
            { title: 'General', description: 'A forum for discussing general topics.', boards: [] },
        ];

        public selectedForum() {
            const index = this.$data.currentForumIndex;
            return this.$data.mainForums[index];
        }
        public setForum(index: number) {
            this.$data.currentForumIndex = index;
        }
        public setBoard(board: { id: number, title: string, description: string }) {
          this.$router.replace(`/board/${board.id}`);
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
        public sinceDate(date: string) {
            return moment(date).fromNow();
        }
        get timeOfDay() {
            return moment(this.world.timeOfDay).format("ddd, MMM Do, ha");
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
            color: $mainBlack;
            text-decoration: none;
        }
        .forum-link:hover {
            color: $mainBlue;
            cursor: pointer;
        }
        .control {        
            flex: 1;
            margin-right: 2em;
            color: $mainBlack;
            h2 {
                margin: .5em 0;
            }
            h3 {
                font-weight: lighter;
                color: $mainGrey;
            }
            .player-showcase {
                display: inline-flex;
                flex-direction: row;
                flex-wrap: nowrap;
                overflow-x: auto;
                width: 100%;
                // auto hide ugly ms scrollbar
                -ms-overflow-style: -ms-autohiding-scrollbar; 
                // smooth mobile scrolling
                -webkit-overflow-scrolling: touch;
                // hide scrollbar in webkit browsers
                &::-webkit-scrollbar { display: none; }
                .player {
                    flex: 0 0 auto;
                    padding: 1em 1em 1em 0;
                    display: flex;
                    flex-direction: row;
                    .title {
                        color: gold;
                        margin: 0;
                    }
                    .subtitle {
                        margin: 0;
                    }
                    .thumbnail {
                        align-self: flex-start;
                        width: 2.3em;
                        border-radius: 1em;
                        margin-right: 5px;
                    }
                }
            }
            .control-head {
                background: white;
                padding: 1em;
                border-radius: 10px;
                margin-bottom: 1em;

                img {
                    width: 200px;
                }
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
                        transform: translateY(-2px);

                        button {
                            flex: 1;
                            cursor: pointer;
                            font-weight: bold;
                            color: white;
                            border: none;
                            font-size: large;
                            padding: 1em;
                            box-shadow: inset 2px 2px 3px #3c3c3c;
                            margin: 0 0 10px 0;

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
                .board-posts {
                    padding-top: 1em;
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
        .post-link-container {
            border-left: 6px solid $mainBlue;
            padding: .1em .5em .5em 1em;
            margin-bottom: 1em;

            transition: .2s all ease-in-out;
            &:hover {
                cursor: pointer;
                background: $mainLightGrey;
                border-left-width: 8px;
            }
            .title {
                font-size: large;
            }
            .preview {
                font-size: medium;
            }
            .footer {
                color: $mainGrey;
            }
        }
    }
</style>