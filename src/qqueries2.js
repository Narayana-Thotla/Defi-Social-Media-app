import { createClient } from "urql";

export const APIURL = "https://api.lens.xyz/graphql";

export const LENS_HUB_CONTRACT_ADDRESS =
  "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d";

// ✅ The global Lens graph address — required for graphFollowStats
export const LENS_GLOBAL_GRAPH = "0xB6Df20bCDaf7b5E9147e445Bc3B2832B15ec0c3f";

export const urlClient = createClient({
  url: APIURL,
  requestPolicy: "network-only",
});

export const queryRecommendedProfiles = `
query DiscoverAccounts {
  accounts(request: {}) {
    items {
      address
      username {
        localName
      }
      metadata {
        name
        bio
        picture
      }
    }
    pageInfo {
      next
    }
  }
}
`;

// ─── FIX: Explore posts — request more items and sort by latest ──────────────
// export const queryExplorePublications = `
// query ExplorePosts {
//   posts(request: { pageSize: FIFTY, timelineType: ALL}) {
//     items {
//       __typename

//       ... on Post {
//         id
//         slug
//         timestamp
//         contentUri

//         author {
//           address
//           username {
//             localName
//             namespace
//           }
//           metadata {
//             name
//             bio
//             picture
//             coverPicture
//           }
//           operations {
//             isFollowedByMe
//             isFollowingMe
//           }
//         }

//         metadata {
//           __typename

//           ... on TextOnlyMetadata {
//             content
//             attributes {
//               key
//               value
//             }
//           }

//           ... on ImageMetadata {
//             content
//             image {
//               item
//               type
//               width
//               height
//             }
//           }

//           ... on VideoMetadata {
//             content
//             video {
//               item
//               type
//             }
//           }

//           ... on AudioMetadata {
//             content
//             audio {
//               item
//               type
//             }
//           }

//           ... on ArticleMetadata {
//             content
//           }

//           ... on LinkMetadata {
//             content
//             sharingLink
//           }
//         }

//         stats {
//           comments
//           reposts
//           reactions
//           collects
//           bookmarks
//           quotes
//         }

//         operations {
//           hasReacted
//           hasBookmarked
//           hasReposted {
//             optimistic
//             onChain
//           }
//           hasCommented {
//             optimistic
//             onChain
//           }
//         }
//       }

//       ... on Repost {
//         id
//         timestamp

//         author {
//           address
//           username {
//             localName
//           }
//           metadata {
//             name
//             bio
//             picture
//             coverPicture
//           }
//         }

//         repostOf {
//           ... on Post {
//             id
//             timestamp
//             metadata {
//               __typename
//               ... on TextOnlyMetadata {
//                 content
//               }
//               ... on ImageMetadata {
//                 content
//                 image {
//                   item
//                   type
//                 }
//               }
//             }
//             stats {
//               comments
//               reposts
//               reactions
//               collects
//             }
//           }
//         }
//       }
//     }

//     pageInfo {
//       next
//     }
//   }
// }
// `;
//---------------------------------------------------------

export const queryExplorePublications = `
query ExplorePosts {
  posts(request: {}) {
    items {
      __typename

      ... on Post {
        id
        slug
        timestamp
        isEdited
        isDeleted
        contentUri

        app {
          address
          metadata {
            name
            logo
            description
            url
          }
        }

        author {
          address
          username {
            localName
            namespace
            linkedTo
          }
          metadata {
            name
            bio
            picture
            coverPicture
          }
          operations {
            isFollowedByMe
            isFollowingMe
            isMutedByMe
            isBlockedByMe
            canFollow {
              __typename
            }
            canUnfollow {
              __typename
            }
          }
        }

        metadata {
          __typename

          ... on TextOnlyMetadata {
            content
            attributes {
              key
              value
            }
          }

          ... on ImageMetadata {
            content
            image {
              item
              type
              width
              height
            }
            attributes {
              key
              value
            }
          }

          ... on VideoMetadata {
            content
            video {
              item
              type
            }
            attributes {
              key
              value
            }
          }

          ... on AudioMetadata {
            content
            audio {
              item
              type
            }
            attributes {
              key
              value
            }
          }

          ... on ArticleMetadata {
            content
            attributes {
              key
              value
            }
          }

          ... on LinkMetadata {
            content
            sharingLink
            attributes {
              key
              value
            }
          }
        }

        stats {
          comments
          reposts
          reactions
          collects
          bookmarks
          quotes
        }

        operations {
          hasReacted
          hasBookmarked
          hasReposted {
            optimistic
            onChain
          }
          hasQuoted {
            optimistic
            onChain
          }
          hasCommented {
            optimistic
            onChain
          }
          canComment {
            __typename
          }
          canRepost {
            __typename
          }
          canQuote {
            __typename
          }
        }

        actions {
          ... on SimpleCollectAction {
            __typename
            address
            collectLimit
            followerOnGraph {
              graph
            }
            endsAt
            isImmutable
            collectNftAddress
            payToCollect {
              referralShare
              recipients {
                address
                percent
              }
              price {
                ... on NativeAmount {
                  asset {
                    ... on NativeToken {
                      name
                      symbol
                      decimals
                      contract {
                        address
                        chainId
                      }
                    }
                  }
                  value
                }
                ... on Erc20Amount {
                  asset {
                    name
                    symbol
                    decimals
                    contract {
                      address
                      chainId
                    }
                  }
                  value
                }
              }
            }
          }
          ... on UnknownPostAction {
            __typename
            address
          }
        }

        rules {
          anyOf {
            id
            type
            address
          }
          required {
            id
            type
            address
          }
        }

        mentions {
          ... on AccountMention {
            account
            namespace
            replace {
              from
              to
            }
          }
          ... on GroupMention {
            group
            replace {
              from
              to
            }
          }
        }

        commentOn {
          id
        }

        quoteOf {
          id
        }

        root {
          id
        }
      }

      ... on Repost {
        id
        timestamp

        author {
          address
          username {
            localName
            namespace
            linkedTo
          }
          metadata {
            name
            bio
            picture
            coverPicture
          }
        }

        repostOf {
          ... on Post {
            id
            timestamp
            metadata {
              __typename
              ... on TextOnlyMetadata {
                content
              }
              ... on ImageMetadata {
                content
                image {
                  item
                  type
                }
              }
              ... on VideoMetadata {
                content
                video {
                  item
                  type
                }
              }
            }
            stats {
              comments
              reposts
              reactions
              collects
            }
          }
        }
      }
    }

    pageInfo {
      next
    }
  }
}
`;

//-------------------------------------------------------

export const FETCH_PROFILE_QUERY = `
  query FetchProfile($address: EvmAddress!) {
    account(request: { address: $address }) {
      address
      username {
        localName
      }
      metadata {
        name
        bio
        picture
        coverPicture
      }
    }
  }
`;

// ─── FIX: Pass the graph address — without it graphFollowStats returns null ───
export const FETCH_ACCOUNT_STATS_QUERY = `
  query FetchAccountStats($address: EvmAddress!) {
    accountStats(request: {
      account: $address,
      graph: "0xB6Df20bCDaf7b5E9147e445Bc3B2832B15ec0c3f"
    }) {
      graphFollowStats {
        followers
        following
      }
      feedStats {
        posts
        comments
        reposts
        quotes
        reacted
        reactions
        collects
      }
    }
  }
`;

// ─── FIX: Also fetch post count from stats so it's accurate ──────────────────
// export const FETCH_ACCOUNT_POSTS_QUERY = `
//   query FetchAccountPosts($address: EvmAddress!) {
//     posts(request: {
//       filter: { authors: [$address] },
//       pageSize: FIFTY
//     }) {
//       items {
//         ... on Post {
//           id
//           timestamp
//           metadata {
//             __typename
//             ... on TextOnlyMetadata {
//               content
//             }
//             ... on ImageMetadata {
//               content
//               image {
//                 item
//               }
//             }
//             ... on ArticleMetadata {
//               content
//             }
//             ... on LinkMetadata {
//               content
//               sharingLink
//             }
//           }
//           stats {
//             comments
//             reposts
//             reactions
//           }
//         }
//       }
//       pageInfo {
//         next
//       }
//     }
//   }
// `;

// export const FETCH_ACCOUNT_POSTS_QUERY = `
//   query FetchAccountPosts($address: EvmAddress!) {
//     accountFeed(request: {
//       account: $address,
//       pageSize: FIFTY
//     }) {
//       items {
//         root {
//           ... on Post {
//             id
//             timestamp
//             metadata {
//               __typename
//               ... on TextOnlyMetadata {
//                 content
//               }
//               ... on ImageMetadata {
//                 content
//                 image { item }
//               }
//             }
//             stats {
//               comments
//               reposts
//               reactions
//             }
//           }
//         }
//       }
//     }
//   }
// `;

export const FETCH_ACCOUNT_POSTS_QUERY = `
  query FetchAccountPosts($address: EvmAddress!) {
    posts(request: { filter: { authors: [$address] } }) {
      items {
        ... on Post {
          id
          timestamp
          metadata {
            ... on TextOnlyMetadata {
              content
            }
            ... on ImageMetadata {
              content
              image {
                item
              }
            }
          }
          stats {
            comments
            reposts
            reactions
          }
        }
      }
    }
  }
`;

export const FETCH_COMMENTS_QUERY = `
  query FetchComments($postId: PostId!) {
    posts(request: { filter: { commentOn: { post: $postId } } }) {
      items {
        ... on Post {
          id
          timestamp
          metadata {
            ... on TextOnlyMetadata {
              content
            }
          }
          author {
            address
            username {
              localName
            }
            metadata {
              name
              picture
            }
          }
        }
      }
    }
  }
`;

// ─── FIX: Use a hosted metadata URI via lens metadata storage ─────────────────
// The post mutation itself is correct — the issue is that data: URIs may be
// silently rejected. Use the Lens metadata storage endpoint instead.
export const CREATE_POST_MUTATION = `
  mutation CreatePost($request: CreatePostRequest!) {
    post(request: $request) {
      ... on PostResponse {
        hash
      }
      ... on SponsoredTransactionRequest {
        reason
      }
      ... on SelfFundedTransactionRequest {
        reason
      }
      ... on TransactionWillFail {
        reason
      }
    }
  }
`;

export const COMMENT_ON_POST_MUTATION = `
  mutation CreatePost($request: CreatePostRequest!) {
    post(request: $request) {
      ... on PostResponse {
        hash
      }
      ... on SponsoredTransactionRequest {
        reason
      }
      ... on SelfFundedTransactionRequest {
        reason
      }
      ... on TransactionWillFail {
        reason
      }
    }
  }
`;

export const ADD_REACTION_MUTATION = `
  mutation AddReaction($request: AddReactionRequest!) {
    addReaction(request: $request) {
      ... on AddReactionResponse {
        success
      }
      ... on AddReactionFailure {
        reason
      }
    }
  }
`;

export const CREATE_POST_TYPED_DATA = `
mutation CreatePostTypedData($request: CreatePostRequest!) {
  createPostTypedData(request: $request) {
    id
    typedData {
      domain {
        name
        version
        chainId
        verifyingContract
      }
      types {
        Post {
          name
          type
        }
      }
      value {
        nonce
        deadline
        contentURI
      }
    }
  }
}
`;

export const BROADCAST_MUTATION = `
mutation Broadcast($request: BroadcastRequest!) {
  broadcast(request: $request) {
    ... on RelayerResult {
      txHash
    }
    ... on RelayError {
      reason
    }
  }
}
`;