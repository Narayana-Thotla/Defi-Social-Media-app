import { createClient } from "urql";

// Latest Lens GraphQL endpoint
export const APIURL = "https://api.lens.xyz/graphql";
// export const APIURL = "https://api-v2.lens.dev/graphql";
// export const APIURL = "http://localhost:4000/lens";

export const LENS_HUB_CONTRACT_ADDRESS =
  "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d";

export const urlClient = createClient({
  url: APIURL,
  requestPolicy: "network-only",
});

// ---------------- PROFILES ----------------

// export const queryRecommendedProfiles = `
// query Profiles {
//   profiles(request: { limit: 10 }) {
//     items {
//       id
//       handle {
//         localName
//       }
//       metadata {
//         displayName
//         bio
//         picture {
//           ... on NftImage {
//             uri
//           }
//           ... on Image {
//             uri
//           }
//         }
//       }
//       stats {
//         followers
//         following
//       }
//     }
//   }
// }
// `;
// ------------------------------------------------
export const queryRecommendedProfiles = `
query DiscoverAccounts {
  accounts(request: {  }) {
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

// ---------------- POSTS ----------------

// export const queryExplorePublications = `
// query Publications {
//   publications(request: { limit: 10 }) {
//     items {
//       ... on Post {
//         id
//         createdAt

//         metadata {
//           ... on TextOnlyMetadata {
//             content
//           }
//           ... on ImageMetadata {
//             content
//             image {
//               uri
//             }
//           }
//         }

//         by {
//           id
//           handle {
//             localName
//           }
//           metadata {
//             displayName
//             picture {
//               ... on NftImage {
//                 uri
//               }
//               ... on Image {
//                 uri
//               }
//             }
//           }
//         }

//         stats {
//           comments
//           mirrors
//           quotes
//         }
//       }
//     }
//   }
// }
// `;

// ------------------------------------------------
// export const queryExplorePublications = `
// query ExplorePosts {
//   posts(request: {}) {
//     items {
//       __typename

//       ... on Post {
//         id
//         timestamp

//         author {
//           address
//           username {
//             localName
//           }
//         }

//         metadata {
//           __typename

//           ... on TextOnlyMetadata {
//             content
//           }

//           ... on ImageMetadata {
//             image {
//               item
//               type
//               width
//               height
//             }
//           }

//           ... on VideoMetadata {
//             video {
//               item
//               type
//             }
//           }
//         }

//         stats {
//           comments
//           reposts
//         }

//         operations {
//           hasReacted
//           hasBookmarked
//           hasReposted {
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
//         }

//         repostOf {
//           ... on Post {
//             id
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

// ----------------------- Final Version -----------------------
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

// -----------------------------------------------------

