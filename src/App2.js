import { useEffect, useState } from "react";
import {
  urlClient,
  queryRecommendedProfiles,
  queryExplorePublications,
} from "./qqueries";
import { ethers } from "ethers";
import { Box, Button, Image } from "@chakra-ui/react";

// const AUTHENTICATE_MUTATION = `
//   mutation Authenticate($request: SignedAuthChallenge!) {
//     authenticate(request: $request) {
//       accessToken
//       refreshToken
//     }
//   }
// `;

const AUTHENTICATE_MUTATION = `
  mutation Authenticate($request: SignedAuthChallenge!) {
    authenticate(request: $request) {
      ... on AuthenticationTokens {
        accessToken
        refreshToken
        idToken
      }
      ... on WrongSignerError {
        reason
      }
      ... on ExpiredChallengeError {
        reason
      }
      ... on ForbiddenError {
        reason
      }
    }
  }
`;

const CHALLENGE_QUERY = `
  query Challenge($request: ChallengeRequest!) {
    challenge(request: $request) {
      id
      text
    }
  }
`;

const CHALLENGE_MUTATION = `
  mutation Challenge($request: ChallengeRequest!) {
    challenge(request: $request) {
      id
      text
    }
  }
`;

// const FOLLOW_MUTATION = `
//   mutation Follow($request: FollowRequest!) {
//     follow(request: $request) {
//       ... on FollowResponse {
//         hash
//       }
//       ... on SponsoredTransactionRequest {
//         reason
//       }
//       ... on SelfFundedTransactionRequest {
//         reason
//       }
//     }
//   }
// `;


const FOLLOW_MUTATION = `
  mutation Follow($request: CreateFollowRequest!) {
    follow(request: $request) {
      ... on FollowResponse {
        hash
      }
      ... on SponsoredTransactionRequest {
        reason
      }
      ... on SelfFundedTransactionRequest {
        reason
      }
    }
  }
`;


function App() {
  const [account, setAccount] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);

  // async function signIn() {
  //   try {
  //       console.log("Starting sign-in process...",window.ethereum);
  //     if (!window.ethereum) {
  //       alert("Please install MetaMask!");
  //       return;
  //     }

  //     // Step 1: Connect wallet
  //     const accounts = await window.ethereum.request({
  //       method: "eth_requestAccounts",
  //     });
  //     const connectedAccount = accounts[0];
  //     setAccount(connectedAccount);

  //     // Step 2: Get challenge from Lens
  //     const challengeResponse = await urlClient.query(CHALLENGE_QUERY, {
  //       request: {
  //         accountOwner: {
  //           account: connectedAccount,
  //           owner: connectedAccount,
  //         },
  //       },
  //     }).toPromise();

  //    { console.log("Challenge response:", challengeResponse);}
  //    { console.log("connected account:", connectedAccount);}
  //     const { id, text } = challengeResponse.data.challenge;

  //     // Step 3: Sign the challenge
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const signature = await signer.signMessage(text);

  //     // Step 4: Authenticate with Lens
  //     const authResponse = await urlClient.mutation(AUTHENTICATE_MUTATION, {
  //       request: { id, signature },
  //     }).toPromise();

  //     const token = authResponse.data.authenticate.accessToken;
  //     setAccessToken(token);
  //     console.log("Authenticated! Access token:", token);

  //   } catch (err) {
  //     console.error("Sign in error:", err);
  //   }
  // }

  // --------------------------------------------------
  // async function signIn() {
  //   try {
  //     if (!window.ethereum) {
  //       alert("Please install MetaMask!");
  //       return;
  //     }

  //     // Step 1: Connect wallet
  //     const accounts = await window.ethereum.request({
  //       method: "eth_requestAccounts",
  //     });
  //     const connectedAccount = accounts[0];
  //     setAccount(connectedAccount);
  //     console.log("Connected account:", connectedAccount);

  //     // Step 2: Get challenge from Lens (mutation not query!)
  //     const challengeResponse = await urlClient.mutation(CHALLENGE_MUTATION, {
  //       request: {
  //         accountOwner: {
  //           account: connectedAccount,
  //           owner: connectedAccount,
  //         },
  //       },
  //     }).toPromise();

  //     console.log("Challenge response:", challengeResponse);

  //     if (!challengeResponse.data?.challenge) {
  //       console.error("Challenge failed:", challengeResponse.error);
  //       alert("Challenge failed: " + challengeResponse.error?.message);
  //       return;
  //     }

  //     const { id, text } = challengeResponse.data.challenge;

  //     // Step 3: Sign the challenge
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const signature = await signer.signMessage(text);
  //     console.log("Signature:", signature);

  //     // Step 4: Authenticate with Lens
  //     const authResponse = await urlClient.mutation(AUTHENTICATE_MUTATION, {
  //       request: { id, signature },
  //     }).toPromise();

  //     console.log("Auth response:", authResponse);

  //     if (!authResponse.data?.authenticate) {
  //       console.error("Auth failed:", authResponse.error);
  //       alert("Auth failed: " + authResponse.error?.message);
  //       return;
  //     }

  //     const token = authResponse.data.authenticate.accessToken;
  //     setAccessToken(token);
  //     console.log("Authenticated! Access token:", token);

  //   } catch (err) {
  //     console.error("Sign in error:", err);
  //     alert("Error: " + err.message);
  //   }
  // }

  // ---------------------------------- SIGN IN FUNCTION USING API ----------------- -----------------
  async function signIn() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      // Step 1: Connect wallet
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      console.log("Connected account:", connectedAccount);

      // Step 2: Get Lens account address
      const accountResponse = await urlClient
        .query(
          `
      query {
        accountsAvailable(request: { 
          managedBy: "${connectedAccount}",
          includeOwned: true 
        }) {
          items {
            ... on AccountOwned {
              account {
                address
                username {
                  localName
                }
              }
            }
          }
        }
      }
    `,
        )
        .toPromise();

      console.log("Accounts available:", accountResponse);

      const lensAccount =
        accountResponse.data?.accountsAvailable?.items?.[0]?.account?.address;

      if (!lensAccount) {
        alert("No Lens account found! Please create one at hey.xyz first.");
        return;
      }

      console.log("Lens account:", lensAccount);

      // Step 3: Get challenge
      const challengeResponse = await urlClient
        .mutation(CHALLENGE_MUTATION, {
          request: {
            accountOwner: {
              account: lensAccount,
              owner: connectedAccount,
            },
          },
        })
        .toPromise();

      console.log("Challenge response:", challengeResponse);

      if (!challengeResponse.data?.challenge) {
        console.error("Challenge failed:", challengeResponse.error);
        alert("Challenge failed: " + challengeResponse.error?.message);
        return;
      }

      const { id, text } = challengeResponse.data.challenge;
      console.log("Challenge id:", id, "text:", text);

      // Step 4: Sign the challenge
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(text);
      console.log("Signature:", signature);

      // Step 5: Authenticate with Lens
      const authResponse = await urlClient
        .mutation(AUTHENTICATE_MUTATION, {
          request: { id, signature },
        })
        .toPromise();

      console.log("Auth response:", authResponse);

      if (!authResponse.data?.authenticate) {
        console.error("Auth failed:", authResponse.error);
        alert("Auth failed: " + authResponse.error?.message);
        return;
      }
      const token = authResponse.data.authenticate.accessToken;
      setAccessToken(token);
      console.log("Authenticated! Access token:", token);
    } catch (err) {
      console.error("Sign in error:", err);
      alert("Error: " + err.message);
    }
  }

  // -------------------------------------------------
  async function getRecommendedProfiles() {
    const response = await urlClient
      .query(queryRecommendedProfiles)
      .toPromise();
    const profiles = response.data.accounts.items;
    setProfiles(profiles);
  }

  async function getPosts() {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();
    const posts = response.data.posts.items;
    setPosts(posts);
  }

  // async function follow(accountAddress) {
  //   if (!accessToken) {
  //     alert("Please sign in first!");
  //     return;
  //   }

  //   const result = await urlClient
  //     .mutation(
  //       FOLLOW_MUTATION,
  //       {
  //         request: { account: accountAddress },
  //       },
  //       {
  //         fetchOptions: {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         },
  //       },
  //     )
  //     .toPromise();

  //   if (result.error) {
  //     console.error("Follow error:", result.error);
  //     return;
  //   }

  //   console.log("Follow result:", result.data);
  //   alert("Followed successfully!");
  // }


  async function follow(accountAddress) {
  if (!accessToken) {
    alert("Please sign in first!");
    return;
  }

  const result = await urlClient.mutation(FOLLOW_MUTATION, {
    request: {
      account: accountAddress,
      graph: "0xB6Df20bCDaf7b5E9147e445Bc3B2832B15ec0c3f",
    },
  }, {
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  }).toPromise();

  if (result.error) {
    console.error("Follow error:", result.error);
    alert("Follow error: " + result.error.message);
    return;
  }

  console.log("Follow result:", result.data);
  alert("Followed successfully!");
}

  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile?.metadata?.picture;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }
      return url;
    }
    return "/default-avatar.png";
  };

  const parseImageUrlForPost = (post) => {
    if (post) {
      const url = post?.author?.metadata?.picture;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }
      return url;
    }
    return "/default-avatar.png";
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <Box width="100%" backgroundColor="rgba(5, 32, 64, 28)">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="55%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          <Box>
            <Box
              fontFamily="DM Serif Display"
              fontSize="44px"
              fontStyle="italic"
            >
              DECENTRA
            </Box>
            <Box>Decentralized Social Media App</Box>
          </Box>
          {account ? (
            <Box backgroundColor="#000" padding="15px" borderRadius="6px">
              {accessToken
                ? "Authenticated ✓"
                : "Connected (not authenticated)"}
            </Box>
          ) : (
            <Button
              onClick={signIn}
              color="rgba(5,32,64)"
              _hover={{ backgroundColor: "#808080" }}
            >
              Connect & Sign In
            </Button>
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="55%"
        margin="35px auto auto auto"
        color="white"
      >
        {/* POSTS */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box
              key={post.id}
              marginBottom="25px"
              backgroundColor="rgba(5, 32, 64, 28)"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                {/* PROFILE IMAGE */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img
                    alt="profile"
                    src={parseImageUrlForPost(post)}
                    width="75px"
                    height="75px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </Box>

                {/* POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="DM Serif Display" fontSize="24px">
                      {post.author?.username?.localName}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        alt="follow-icon"
                        src="/follow-icon.png"
                        width="50px"
                        height="50px"
                        onClick={() => follow(post.author.address)}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="14px">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FRIEND SUGGESTIONS */}
        <Box
          width="30%"
          backgroundColor="rgba(5, 32, 64, 28)"
          padding="40px 25px"
          borderRadius="6px"
          height="fit-content"
        >
          <Box fontFamily="DM Serif Display">FRIEND SUGGESTIONS</Box>
          <Box>
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
                _hover={{ color: "#808080", cursor: "pointer" }}
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="40px"
                  height="40px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/default-avatar.png";
                  }}
                />
                <Box marginLeft="25px">
                  <h4>{profile.metadata.name}</h4>
                  <p>{profile.username.localName}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default App;
