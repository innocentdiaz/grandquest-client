<template>
    <div class="forum">
        <div class="control">
            <div class="user-control" v-if="user.authenticated">
                <h2>{{user.username}}</h2>
                <p>Joined {{ userJoinDate }}</p>
            </div>
            <div class="user-control" v-else>
                <h2>Have an account?</h2>
            </div>
            <div class="forum-control">
                <h2>What's trending</h2>
                <h3>Live feed</h3>
                <p>[ Live feed coming soon ]</p>
            </div>
        </div>
        
        <div class="forum-content">
            <div class="forum-main">
                <!-- header rendering -->
                <div class="header">
                    <span>
                        FORUMS - {{selectedForum().title}}
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
                    <div class="board-posts">
                        <div class="post">
                            <div v-if="selectedBoard.loading">
                                <ActivityIndicator size="36"/>
                            </div>
                            <div v-else-if="selectedBoard.posts.length">
                                <div v-for="post in selectedBoard.posts" :key="post.id" class="post-link-container" v-on:click="setPost(post)">
                                    <h1 class="title">{{ post.title }}</h1>
                                    <p class="preview">{{ post.body }}</p>
                                    <span class="footer">Submitted {{sinceDate(post.created_at)}} by {{ post.user ? post.user.username : ' an anonymous user' }}</span>
                                </div>
                            </div>
                            <div v-else>
                                <p>There are no posts in this board.</p>
                            </div>
                        </div>
                    </div>
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
    import { User } from '../../types';
    import ActivityIndicator from '../../components/ActivityIndicator.vue';

    @Component({
        components: { ActivityIndicator },
    })

    export default class Forum extends Vue {
        @State public user!: User;
        @Getter public userJoinDate!: string;

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
            { title: 'Art', description: 'Dedicated to the discussion of music, painting, poetry.', boards: [] },
            { title: 'General', description: 'A forum for discussing general topics.', boards: [] },
        ];

        public selectedForum() {
            const index = this.$data.currentForumIndex;
            return this.$data.mainForums[index];
        }
        public setForum(index: number) {
            this.$data.selectedBoard = null;
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
            
            .user-control {
                padding: 12px;
                min-height: 150px;
                border-radius: 10px;
                background: $mainGreen;
                color: white;
                margin-bottom: 1em;
            }
            .forum-control, .selected-board-control {
                padding: 12px;
                background: white;
                border-radius: 10px;
                min-height: 250px;
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