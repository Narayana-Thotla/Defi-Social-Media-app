// import { useEffect, useState } from "react";
// import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
// import {
//   urlClient,
//   queryRecommendedProfiles,
//   queryExplorePublications,
// } from "./qqueries";
// import {
//   CREATE_POST_MUTATION,
//   ADD_REACTION_MUTATION,
//   COMMENT_ON_POST_MUTATION,
//   FETCH_COMMENTS_QUERY,
// } from "./qqueries2"; // ← add these exports to your qqueries file
// import { ethers } from "ethers";
// import { Box, Button, Image, Textarea, Spinner } from "@chakra-ui/react";
// import ProfilePage from "./Profilepage";
// import { CommentModal } from "./CommentModal";

// // ─── GraphQL mutations (keep your existing ones too) ─────────────────────────

// const AUTHENTICATE_MUTATION = `
//   mutation Authenticate($request: SignedAuthChallenge!) {
//     authenticate(request: $request) {
//       ... on AuthenticationTokens {
//         accessToken
//         refreshToken
//         idToken
//       }
//       ... on WrongSignerError { reason }
//       ... on ExpiredChallengeError { reason }
//       ... on ForbiddenError { reason }
//     }
//   }
// `;

// const CHALLENGE_MUTATION = `
//   mutation Challenge($request: ChallengeRequest!) {
//     challenge(request: $request) {
//       id
//       text
//     }
//   }
// `;

// const FOLLOW_MUTATION = `
//   mutation Follow($request: CreateFollowRequest!) {
//     follow(request: $request) {
//       ... on FollowResponse { hash }
//       ... on SponsoredTransactionRequest { reason }
//       ... on SelfFundedTransactionRequest { reason }
//     }
//   }
// `;

// // ─── Helper ──────────────────────────────────────────────────────────────────

// const parseImageUrl = (url) => {
//   if (!url) return "/default-avatar.png";
//   if (url.startsWith("ipfs:")) {
//     const hash = url.split("//")[1];
//     return `https://gateway.pinata.cloud/ipfs/${hash}`;
//   }
//   return url;
// };

// const authHeaders = (token) => ({
//   fetchOptions: { headers: { Authorization: `Bearer ${token}` } },
// });

// // ─── Comment Modal ────────────────────────────────────────────────────────────

// // function CommentModal({ post, accessToken, lensAccount, onClose }) {
// //   const [comments, setComments] = useState([]);
// //   const [text, setText] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [fetching, setFetching] = useState(true);

// //   useEffect(() => {
// //     async function load() {
// //       const res = await urlClient
// //         .query(FETCH_COMMENTS_QUERY, { postId: post.id })
// //         .toPromise();
// //       setComments(res.data?.posts?.items || []);
// //       setFetching(false);
// //     }
// //     load();
// //   }, [post.id]);

// //   async function submitComment() {
// //     if (!text.trim() || !accessToken) return;
// //     setLoading(true);
// //     try {
// //       const result = await urlClient
// //         .mutation(
// //           COMMENT_ON_POST_MUTATION,
// //           {
// //             request: {
// //               contentUri: `data:application/json,${encodeURIComponent(
// //                 JSON.stringify({
// //                   $schema: "https://json-schemas.lens.dev/publications/text-only/3.0.0.json",
// //                   lens: {
// //                     mainContentFocus: "TEXT_ONLY",
// //                     content: text,
// //                     locale: "en",
// //                     tags: [],
// //                   },
// //                 })
// //               )}`,
// //               commentOn: post.id,
// //             },
// //           },
// //           authHeaders(accessToken)
// //         )
// //         .toPromise();

// //       if (result.error) throw new Error(result.error.message);

// //       // Optimistically add
// //       setComments((prev) => [
// //         {
// //           id: Date.now(),
// //           metadata: { content: text },
// //           author: { username: { localName: "you" }, metadata: { picture: null } },
// //           timestamp: new Date().toISOString(),
// //         },
// //         ...prev,
// //       ]);
// //       setText("");
// //     } catch (err) {
// //       alert("Comment failed: " + err.message);
// //     }
// //     setLoading(false);
// //   }

// //   return (
// //     <Box
// //       position="fixed"
// //       top="0"
// //       left="0"
// //       width="100vw"
// //       height="100vh"
// //       backgroundColor="rgba(0,0,0,0.7)"
// //       display="flex"
// //       alignItems="center"
// //       justifyContent="center"
// //       zIndex="1000"
// //       onClick={onClose}
// //     >
// //       <Box
// //         backgroundColor="#0a1628"
// //         borderRadius="10px"
// //         padding="30px"
// //         width="500px"
// //         maxHeight="80vh"
// //         overflowY="auto"
// //         onClick={(e) => e.stopPropagation()}
// //         color="white"
// //       >
// //         <Box fontFamily="DM Serif Display" fontSize="20px" mb="15px">
// //           Comments on @{post.author?.username?.localName}'s post
// //         </Box>

// //         {/* Original post */}
// //         <Box
// //           backgroundColor="rgba(255,255,255,0.05)"
// //           borderRadius="8px"
// //           padding="12px"
// //           mb="15px"
// //           fontSize="13px"
// //           color="#ccd"
// //         >
// //           {post.metadata?.content}
// //         </Box>

// //         {/* New comment box */}
// //         {accessToken ? (
// //           <Box mb="20px">
// //             <Textarea
// //               value={text}
// //               onChange={(e) => setText(e.target.value)}
// //               placeholder="Write a comment..."
// //               backgroundColor="#0d1f3c"
// //               color="white"
// //               border="1px solid #1a4a7a"
// //               borderRadius="6px"
// //               mb="8px"
// //               _placeholder={{ color: "#556" }}
// //             />
// //             <Button
// //               onClick={submitComment}
// //               isLoading={loading}
// //               size="sm"
// //               backgroundColor="#1a4a7a"
// //               color="white"
// //               _hover={{ backgroundColor: "#2a6aaa" }}
// //             >
// //               Post Comment
// //             </Button>
// //           </Box>
// //         ) : (
// //           <Box mb="15px" fontSize="13px" color="#aab">
// //             Sign in to comment.
// //           </Box>
// //         )}

// //         {/* Comments list */}
// //         {fetching ? (
// //           <Spinner color="white" />
// //         ) : comments.length === 0 ? (
// //           <Box color="#aab" fontSize="13px">
// //             No comments yet. Be the first!
// //           </Box>
// //         ) : (
// //           comments.map((c) => (
// //             <Box
// //               key={c.id}
// //               display="flex"
// //               gap="10px"
// //               mb="12px"
// //               alignItems="flex-start"
// //             >
// //               <img
// //                 src={parseImageUrl(c.author?.metadata?.picture)}
// //                 width="32px"
// //                 height="32px"
// //                 style={{ borderRadius: "50%", flexShrink: 0 }}
// //                 onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
// //                 alt="avatar"
// //               />
// //               <Box>
// //                 <Box fontSize="12px" color="#7a9bbf" mb="2px">
// //                   @{c.author?.username?.localName}
// //                 </Box>
// //                 <Box fontSize="13px">{c.metadata?.content}</Box>
// //               </Box>
// //             </Box>
// //           ))
// //         )}

// //         <Box mt="20px" textAlign="right">
// //           <Button
// //             size="sm"
// //             onClick={onClose}
// //             backgroundColor="transparent"
// //             color="#aab"
// //             border="1px solid #333"
// //           >
// //             Close
// //           </Button>
// //         </Box>
// //       </Box>
// //     </Box>
// //   );
// // }

// // ─── Post Card ────────────────────────────────────────────────────────────────

// function PostCard({ post, accessToken, lensAccount }) {
//   const navigate = useNavigate();
//   const [liked, setLiked] = useState(post.operations?.hasReacted || false);
//   const [likeCount, setLikeCount] = useState(post.stats?.reactions || 0);
//   const [showComments, setShowComments] = useState(false);

//   async function toggleLike() {
//     if (!accessToken) { alert("Please sign in first!"); return; }

//     const newLiked = !liked;
//     setLiked(newLiked);
//     setLikeCount((c) => c + (newLiked ? 1 : -1));

//     await urlClient
//       .mutation(
//         ADD_REACTION_MUTATION,
//         {
//           request: {
//             post: post.id,
//             reaction: newLiked ? "UPVOTE" : "DOWNVOTE",
//           },
//         },
//         authHeaders(accessToken)
//       )
//       .toPromise();
//   }

//   async function follow(accountAddress) {
//     if (!accessToken) { alert("Please sign in first!"); return; }
//     const result = await urlClient
//       .mutation(
//         FOLLOW_MUTATION,
//         {
//           request: {
//             account: accountAddress,
//             graph: "0xB6Df20bCDaf7b5E9147e445Bc3B2832B15ec0c3f",
//           },
//         },
//         authHeaders(accessToken)
//       )
//       .toPromise();

//     if (result.error) { alert("Follow error: " + result.error.message); return; }
//     alert("Followed successfully!");
//   }

//   return (
//     <>
//       <Box
//         marginBottom="25px"
//         backgroundColor="rgba(5, 32, 64, 0.9)"
//         padding="30px 30px 20px 25px"
//         borderRadius="8px"
//       >
//         <Box display="flex">
//           {/* Avatar — click to go to profile */}
//           <Box
//             width="60px"
//             height="60px"
//             flexShrink={0}
//             cursor="pointer"
//             onClick={() => navigate(`/profile/${post.author?.address}`)}
//           >
//             <img
//               alt="profile"
//               src={parseImageUrl(post.author?.metadata?.picture)}
//               width="60px"
//               height="60px"
//               style={{ borderRadius: "50%", border: "2px solid #1a4a7a" }}
//               onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
//             />
//           </Box>

//           <Box flexGrow={1} marginLeft="15px">
//             <Box display="flex" justifyContent="space-between" alignItems="center">
//               <Box
//                 fontFamily="DM Serif Display"
//                 fontSize="20px"
//                 cursor="pointer"
//                 _hover={{ color: "#7a9bbf" }}
//                 onClick={() => navigate(`/profile/${post.author?.address}`)}
//               >
//                 {post.author?.username?.localName}
//               </Box>
//               <Image
//                 alt="follow"
//                 src="/follow-icon.png"
//                 width="40px"
//                 height="40px"
//                 cursor="pointer"
//                 onClick={() => follow(post.author?.address)}
//               />
//             </Box>

//             <Box fontSize="14px" overflowWrap="anywhere" mt="6px" mb="14px">
//               {post.metadata?.content}
//             </Box>

//             {/* Action bar */}
//             <Box display="flex" gap="20px" fontSize="13px" color="#7a9bbf">
//               {/* Like */}
//               <Box
//                 cursor="pointer"
//                 onClick={toggleLike}
//                 color={liked ? "#e05a7a" : "#7a9bbf"}
//                 _hover={{ color: "#e05a7a" }}
//                 display="flex"
//                 alignItems="center"
//                 gap="4px"
//               >
//                 {liked ? "❤️" : "🤍"} {likeCount}
//               </Box>

//               {/* Comment */}
//               <Box
//                 cursor="pointer"
//                 onClick={() => setShowComments(true)}
//                 _hover={{ color: "white" }}
//                 display="flex"
//                 alignItems="center"
//                 gap="4px"
//               >
//                 💬 {post.stats?.comments ?? 0}
//               </Box>

//               {/* Reposts */}
//               <Box display="flex" alignItems="center" gap="4px">
//                 🔁 {post.stats?.reposts ?? 0}
//               </Box>

//               <Box marginLeft="auto" fontSize="11px" color="#556">
//                 {new Date(post.timestamp).toLocaleDateString()}
//               </Box>
//             </Box>
//           </Box>
//         </Box>
//       </Box>

//       {showComments && (
//         <CommentModal
//           post={post}
//           accessToken={accessToken}
//           lensAccount={lensAccount}
//           onClose={() => setShowComments(false)}
//         />
//       )}
//     </>
//   );
// }

// // ─── Create Post ──────────────────────────────────────────────────────────────

// function CreatePost({ accessToken, onPostCreated }) {
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function submitPost() {
//     if (!text.trim() || !accessToken) return;
//     setLoading(true);
//     try {
//       const metadata = {
//         $schema:
//           "https://json-schemas.lens.dev/publications/text-only/3.0.0.json",
//         lens: {
//           mainContentFocus: "TEXT_ONLY",
//           content: text,
//           locale: "en",
//           tags: [],
//         },
//       };

//       const result = await urlClient
//         .mutation(
//           CREATE_POST_MUTATION,
//           {
//             request: {
//               contentUri: `data:application/json,${encodeURIComponent(
//                 JSON.stringify(metadata)
//               )}`,
//             },
//           },
//           authHeaders(accessToken)
//         )
//         .toPromise();

//       if (result.error) throw new Error(result.error.message);

//       setText("");
//       alert("Post created! It may take a moment to appear.");
//       if (onPostCreated) onPostCreated();
//     } catch (err) {
//       alert("Post failed: " + err.message);
//     }
//     setLoading(false);
//   }

//   if (!accessToken) return null;

//   return (
//     <Box
//       backgroundColor="rgba(5,32,64,0.9)"
//       borderRadius="8px"
//       padding="20px"
//       mb="25px"
//     >
//       <Box fontFamily="DM Serif Display" fontSize="16px" color="white" mb="10px">
//         What's on your mind?
//       </Box>
//       <Textarea
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Share something with the world..."
//         backgroundColor="#0d1f3c"
//         color="white"
//         border="1px solid #1a4a7a"
//         borderRadius="6px"
//         mb="10px"
//         _placeholder={{ color: "#556" }}
//       />
//       <Button
//         onClick={submitPost}
//         isLoading={loading}
//         isDisabled={!text.trim()}
//         backgroundColor="#1a4a7a"
//         color="white"
//         _hover={{ backgroundColor: "#2a6aaa" }}
//         size="sm"
//       >
//         Post
//       </Button>
//     </Box>
//   );
// }

// // ─── Main Feed ────────────────────────────────────────────────────────────────

// function Feed({ account, accessToken, lensAccount, signIn }) {
//   const [profiles, setProfiles] = useState([]);
//   const [posts, setPosts] = useState([]);
//   const navigate = useNavigate();

//   async function getRecommendedProfiles() {
//     const res = await urlClient.query(queryRecommendedProfiles).toPromise();
//     setProfiles(res.data?.accounts?.items || []);
//   }

//   async function getPosts() {
//     const res = await urlClient.query(queryExplorePublications).toPromise();
//     setPosts(res.data?.posts?.items || []);
//   }

//   useEffect(() => {
//     getRecommendedProfiles();
//     getPosts();
//   }, []);

//   return (
//     <Box
//       display="flex"
//       justifyContent="space-between"
//       width="55%"
//       margin="35px auto auto auto"
//       color="white"
//     >
//       {/* POSTS */}
//       <Box width="65%" maxWidth="65%" minWidth="65%">
//         <CreatePost accessToken={accessToken} onPostCreated={getPosts} />

//         {posts.map((post) =>
//           post.__typename === "Post" ? (
//             <PostCard
//               key={post.id}
//               post={post}
//               accessToken={accessToken}
//               lensAccount={lensAccount}
//             />
//           ) : null
//         )}
//       </Box>

//       {/* FRIEND SUGGESTIONS */}
//       <Box
//         width="30%"
//         backgroundColor="rgba(5, 32, 64, 0.9)"
//         padding="40px 25px"
//         borderRadius="6px"
//         height="fit-content"
//       >
//         <Box fontFamily="DM Serif Display">FRIEND SUGGESTIONS</Box>
//         {profiles.map((profile) => (
//           <Box
//             key={profile.address}
//             margin="30px 0"
//             display="flex"
//             alignItems="center"
//             height="40px"
//             _hover={{ color: "#808080", cursor: "pointer" }}
//             onClick={() => navigate(`/profile/${profile.address}`)}
//           >
//             <img
//               alt="profile"
//               src={parseImageUrl(profile.metadata?.picture)}
//               width="40px"
//               height="40px"
//               style={{ borderRadius: "50%" }}
//               onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
//             />
//             <Box marginLeft="15px">
//               <Box fontWeight="bold" fontSize="13px">
//                 {profile.metadata?.name}
//               </Box>
//               <Box fontSize="12px" color="#aab">
//                 @{profile.username?.localName}
//               </Box>
//             </Box>
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// }

// // ─── App Shell ────────────────────────────────────────────────────────────────

// function AppShell() {
//   const [account, setAccount] = useState(null);
//   const [accessToken, setAccessToken] = useState(null);
//   const [lensAccount, setLensAccount] = useState(null);

//   async function signIn() {
//     try {
//       if (!window.ethereum) { alert("Please install MetaMask!"); return; }

//       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       const connectedAccount = accounts[0];
//       setAccount(connectedAccount);

//       const accountResponse = await urlClient
//         .query(
//           `query {
//             accountsAvailable(request: { managedBy: "${connectedAccount}", includeOwned: true }) {
//               items {
//                 ... on AccountOwned {
//                   account {
//                     address
//                     username { localName }
//                   }
//                 }
//               }
//             }
//           }`
//         )
//         .toPromise();

//       const la = accountResponse.data?.accountsAvailable?.items?.[0]?.account?.address;
//       if (!la) { alert("No Lens account found! Please create one at hey.xyz first."); return; }
//       setLensAccount(la);

//       const challengeResponse = await urlClient
//         .mutation(CHALLENGE_MUTATION, {
//           request: { accountOwner: { account: la, owner: connectedAccount } },
//         })
//         .toPromise();

//       const { id, text } = challengeResponse.data.challenge;

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const signature = await signer.signMessage(text);

//       const authResponse = await urlClient
//         .mutation(AUTHENTICATE_MUTATION, { request: { id, signature } })
//         .toPromise();

//       const token = authResponse.data?.authenticate?.accessToken;
//       setAccessToken(token);
//     } catch (err) {
//       console.error(err);
//       alert("Error: " + err.message);
//     }
//   }

//   return (
//     <div className="app">
//       {/* NAVBAR */}
//       <Box width="100%" backgroundColor="rgba(5, 32, 64, 28)">
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//           width="55%"
//           margin="auto"
//           color="white"
//           padding="10px 0"
//         >
//           <Box>
//             <Box fontFamily="DM Serif Display" fontSize="44px" fontStyle="italic">
//               DECENTRA
//             </Box>
//             <Box fontSize="13px" color="#aab">
//               Decentralized Social Media App
//             </Box>
//           </Box>

//           <Box display="flex" alignItems="center" gap="12px">
//             {lensAccount && (
//               <Box
//                 cursor="pointer"
//                 color="#7a9bbf"
//                 fontSize="13px"
//                 _hover={{ color: "white" }}
//                 onClick={() => {
//                   // Navigate to own profile
//                   window.location.href = `/profile/${lensAccount}`;
//                 }}
//               >
//                 My Profile
//               </Box>
//             )}
//             {account ? (
//               <Box backgroundColor="#000" padding="12px 15px" borderRadius="6px" fontSize="13px">
//                 {accessToken ? "Authenticated ✓" : "Connected (not authenticated)"}
//               </Box>
//             ) : (
//               <Button
//                 onClick={signIn}
//                 color="rgba(5,32,64)"
//                 _hover={{ backgroundColor: "#808080" }}
//               >
//                 Connect & Sign In
//               </Button>
//             )}
//           </Box>
//         </Box>
//       </Box>

//       {/* ROUTES */}
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <Feed
//               account={account}
//               accessToken={accessToken}
//               lensAccount={lensAccount}
//               signIn={signIn}
//             />
//           }
//         />
//         <Route
//           path="/profile/:address"
//           element={
//             <ProfilePage
//               accessToken={accessToken}
//               currentUserAddress={lensAccount}
//             />
//           }
//         />
//       </Routes>
//     </div>
//   );
// }

// // ─── Root export (wrap with BrowserRouter) ────────────────────────────────────

// function App() {
//   return (
//     <BrowserRouter>
//       <AppShell />
//     </BrowserRouter>
//   );
// }

// export default App;

//--------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import {
  urlClient,
  queryRecommendedProfiles,
  queryExplorePublications,
} from "./qqueries";
import {
  CREATE_POST_MUTATION,
  ADD_REACTION_MUTATION,
  COMMENT_ON_POST_MUTATION,
  FETCH_COMMENTS_QUERY,
  BROADCAST_MUTATION,
  CREATE_POST_TYPED_DATA
} from "./qqueries";
import { ethers } from "ethers";
import { Box, Button, Image, Textarea, Spinner } from "@chakra-ui/react";
import ProfilePage from "./Profilepage";
import ProfilePageOriginal from "./ProfilepageOrigianl";

import { CommentModal } from "./CommentModal";

// ─── GraphQL mutations ────────────────────────────────────────────────────────

const AUTHENTICATE_MUTATION = `
  mutation Authenticate($request: SignedAuthChallenge!) {
    authenticate(request: $request) {
      ... on AuthenticationTokens {
        accessToken
        refreshToken
        idToken
      }
      ... on WrongSignerError { reason }
      ... on ExpiredChallengeError { reason }
      ... on ForbiddenError { reason }
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

const FOLLOW_MUTATION = `
  mutation Follow($request: CreateFollowRequest!) {
    follow(request: $request) {
      ... on FollowResponse { hash }
      ... on SponsoredTransactionRequest { reason }
      ... on SelfFundedTransactionRequest { reason }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("ipfs:")) {
    const hash = url.split("//")[1];
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  return url;
};

const authHeaders = (token) => ({
  fetchOptions: { headers: { Authorization: `Bearer ${token}` } },
});

// ─── FIX: Upload metadata to Lens storage so it gets properly indexed ─────────
// data: URIs are often silently rejected or not indexed by Lens v3.
// This uploads the JSON to lens metadata storage and returns a lens:// URI.
async function uploadMetadataToLens(metadata, accessToken) {
  try {
    const res = await fetch("https://api.lens.xyz/metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Metadata upload failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log("Metadata upload result:", data);

    // Returns { uri: "lens://..." } or similar
    if (data.uri) return data.uri;
    if (data.id) return `lens://${data.id}`;

    throw new Error(
      "No URI returned from metadata upload: " + JSON.stringify(data),
    );
  } catch (err) {
    console.error("Metadata upload error:", err);
    // Fallback: use data URI (less reliable but better than nothing)
    console.warn(
      "Falling back to data: URI — post may not appear in feed immediately",
    );
    return `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;
  }
}

async function uploadToIPFS(metadata) {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: "0076d5e43d98961ff317",
      pinata_secret_api_key:
        "6af0f53a24411360bbdfdfc6f5fc1e05590bad27171521b11215c93286edf57c",
    },
    body: JSON.stringify(metadata),
  });

  const data = await res.json();
  console.log("PINATA RESPONSE:", data);
  return `ipfs://${data.IpfsHash}`;
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, accessToken, lensAccount }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.operations?.hasReacted || false);
  const [likeCount, setLikeCount] = useState(post.stats?.reactions || 0);
  const [showComments, setShowComments] = useState(false);

  async function toggleLike() {
    if (!accessToken) {
      alert("Please sign in first!");
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));

    await urlClient
      .mutation(
        ADD_REACTION_MUTATION,
        {
          request: {
            post: post.id,
            reaction: newLiked ? "UPVOTE" : "DOWNVOTE",
          },
        },
        authHeaders(accessToken),
      )
      .toPromise();
  }

  async function follow(accountAddress) {
    if (!accessToken) {
      alert("Please sign in first!");
      return;
    }
    const result = await urlClient
      .mutation(
        FOLLOW_MUTATION,
        {
          request: {
            account: accountAddress,
            graph: "0xB6Df20bCDaf7b5E9147e445Bc3B2832B15ec0c3f",
          },
        },
        authHeaders(accessToken),
      )
      .toPromise();

    if (result.error) {
      alert("Follow error: " + result.error.message);
      return;
    }
    alert("Followed successfully!");
  }

  return (
    <>
      <Box
        marginBottom="25px"
        backgroundColor="rgba(5, 32, 64, 0.9)"
        padding="30px 30px 20px 25px"
        borderRadius="8px"
      >
        <Box display="flex">
          <Box
            width="60px"
            height="60px"
            flexShrink={0}
            cursor="pointer"
            onClick={() => navigate(`/profile/${post.author?.address}`)}
          >
            <img
              alt="profile"
              src={parseImageUrl(post.author?.metadata?.picture)}
              width="60px"
              height="60px"
              style={{ borderRadius: "50%", border: "2px solid #1a4a7a" }}
              onError={(e) => {
                e.currentTarget.src = "/default-avatar.png";
              }}
            />
          </Box>

          <Box flexGrow={1} marginLeft="15px">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                fontFamily="DM Serif Display"
                fontSize="20px"
                cursor="pointer"
                _hover={{ color: "#7a9bbf" }}
                onClick={() => navigate(`/profile/${post.author?.address}`)}
              >
                {post.author?.username?.localName}
              </Box>
              <Image
                alt="follow"
                src="/follow-icon.png"
                width="40px"
                height="40px"
                cursor="pointer"
                onClick={() => follow(post.author?.address)}
              />
            </Box>

            <Box fontSize="14px" overflowWrap="anywhere" mt="6px" mb="14px">
              {post.metadata?.content}
            </Box>

            <Box display="flex" gap="20px" fontSize="13px" color="#7a9bbf">
              <Box
                cursor="pointer"
                onClick={toggleLike}
                color={liked ? "#e05a7a" : "#7a9bbf"}
                _hover={{ color: "#e05a7a" }}
                display="flex"
                alignItems="center"
                gap="4px"
              >
                {liked ? "❤️" : "🤍"} {likeCount}
              </Box>

              <Box
                cursor="pointer"
                onClick={() => setShowComments(true)}
                _hover={{ color: "white" }}
                display="flex"
                alignItems="center"
                gap="4px"
              >
                💬 {post.stats?.comments ?? 0}
              </Box>

              <Box display="flex" alignItems="center" gap="4px">
                🔁 {post.stats?.reposts ?? 0}
              </Box>

              <Box marginLeft="auto" fontSize="11px" color="#556">
                {new Date(post.timestamp).toLocaleDateString()}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {showComments && (
        <CommentModal
          post={post}
          accessToken={accessToken}
          lensAccount={lensAccount}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}

// ─── Create Post ──────────────────────────────────────────────────────────────

function CreatePost({ accessToken, lensAccount, onPostCreated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // async function submitPost() {
  //   if (!text.trim() || !accessToken) return;
  //   setLoading(true);

  //   try {
  //     // const metadata = {
  //     //   $schema:
  //     //     "https://json-schemas.lens.dev/publications/text-only/3.0.0.json",
  //     //   lens: {
  //     //     mainContentFocus: "TEXT_ONLY",
  //     //     content: text,
  //     //     locale: "en",
  //     //     tags: [],
  //     //   },
  //     // };

  //     //       const metadata = {
  //     //   $schema:
  //     //     "https://json-schemas.lens.dev/publications/text-only/3.0.0.json",
  //     //   mainContentFocus: "TEXT_ONLY",
  //     //   content: text,
  //     //   locale: "en",
  //     //   tags: [],
  //     // };

  //     const metadata = {
  //       $schema:
  //         "https://json-schemas.lens.dev/publications/text-only/3.0.0.json",
  //       id: crypto.randomUUID(), // ✅ REQUIRED
  //       content: text, // ✅ REQUIRED
  //       locale: "en", // ✅ REQUIRED
  //       mainContentFocus: "TEXT_ONLY", // ✅ REQUIRED
  //     };

  //     // ✅ FIX: Upload metadata to Lens storage first — data: URIs don't get indexed
  //     const contentUri = await uploadMetadataToLens(metadata, accessToken);
  //     // const contentUri = await uploadToIPFS(metadata);
  //     console.log("Using contentUri:", contentUri);

  //     const result = await urlClient
  //       .mutation(
  //         CREATE_POST_MUTATION,
  //         { request: { contentUri } },
  //         authHeaders(accessToken),
  //       )
  //       .toPromise();

  //     console.log("Post mutation result:", result);

  //     if (result.error) throw new Error(result.error.message);

  //     const postResponse = result.data?.post;
  //     if (postResponse?.reason) {
  //       throw new Error(postResponse.reason);
  //     }

  //     if (postResponse?.__typename === "PostResponse") {
  //       setText("");
  //       alert(
  //         `Post submitted! Transaction hash: ${postResponse.hash}\n\nIt may take 30–60 seconds to appear in the feed while it's being indexed on-chain.`,
  //       );

  //       console.log("FULL POST RESPONSE:", result.data.post);
  //       console.log("METADATA:", metadata);
  //       console.log("CONTENT URI:", contentUri);

  //       // Wait a moment then refresh — Lens needs time to index
  //       setTimeout(() => {
  //         if (onPostCreated) onPostCreated();
  //       }, 5000);
  //     } else {
  //       throw new Error("Unexpected response: " + JSON.stringify(postResponse));
  //     }
  //   } catch (err) {
  //     console.error("Post error:", err);
  //     alert("Post failed: " + err.message);
  //   }

  //   setLoading(false);
  // }

  //------------------------------------------------------------------
// App.jsx — replace your entire submitPost with this:
async function submitPost() {
  if (!text.trim() || !accessToken) return;
  setLoading(true);
  try {
    // 1. Build metadata
    const metadata = {
      "$schema": "https://json-schemas.lens.dev/posts/text-only/3.0.0.json",
      lens: {                          // ← must be nested under "lens" key
        id: crypto.randomUUID(),
        content: text,
        locale: "en",
        mainContentFocus: "TEXT_ONLY",
        tags: [],
      },
    };

    // 2. Upload to Pinata — this part is already working ✅
    const contentUri = await uploadToIPFS(metadata);
    console.log("contentUri:", contentUri); // should be ipfs://Qm...

    // 3. Post directly — no typed data, no broadcast needed in v3
    const result = await urlClient
      .mutation(
        CREATE_POST_MUTATION,
        { request: { contentUri } },
        authHeaders(accessToken)
      )
      .toPromise();

    console.log("Post result:", result);

    if (result.error) throw new Error(result.error.message);

    const response = result.data?.post;

    if (response?.__typename === "PostResponse") {
      setText("");
      alert("Post created ✅ Hash: " + response.hash);
      setTimeout(() => onPostCreated?.(), 5000); // wait for indexing
    } else if (response?.reason) {
      throw new Error("Post rejected: " + response.reason);
    } else {
      throw new Error("Unknown response: " + JSON.stringify(response));
    }
  } catch (err) {
    console.error(err);
    alert("Post failed: " + err.message);
  }
  setLoading(false);
}
  //------------------------------------------------------------------

  if (!accessToken) return null;

  return (
    <Box
      backgroundColor="rgba(5,32,64,0.9)"
      borderRadius="8px"
      padding="20px"
      mb="25px"
    >
      <Box
        fontFamily="DM Serif Display"
        fontSize="16px"
        color="white"
        mb="10px"
      >
        What's on your mind?
      </Box>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share something with the world..."
        backgroundColor="#0d1f3c"
        color="white"
        border="1px solid #1a4a7a"
        borderRadius="6px"
        mb="10px"
        _placeholder={{ color: "#556" }}
      />
      <Button
        onClick={submitPost}
        isLoading={loading}
        isDisabled={!text.trim()}
        backgroundColor="#1a4a7a"
        color="white"
        _hover={{ backgroundColor: "#2a6aaa" }}
        size="sm"
      >
        Post
      </Button>
    </Box>
  );
}

// ─── Main Feed ────────────────────────────────────────────────────────────────

function Feed({ account, accessToken, lensAccount, signIn }) {
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  async function getRecommendedProfiles() {
    const res = await urlClient.query(queryRecommendedProfiles).toPromise();
    setProfiles(res.data?.accounts?.items || []);
  }

  // async function getPosts() {
  //   const res = await urlClient.query(queryExplorePublications).toPromise();
  //   console.log("Feed posts response:", res);
  //   setPosts(res.data?.posts?.items || []);
  // }

  async function getPosts() {
    const res = await urlClient
      .query(queryExplorePublications, {}, authHeaders(accessToken))
      .toPromise();

    setPosts(res.data?.posts?.items || []);
  }

  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      width="55%"
      margin="35px auto auto auto"
      color="white"
    >
      {/* POSTS */}
      <Box width="65%" maxWidth="65%" minWidth="65%">
        <CreatePost
          accessToken={accessToken}
          lensAccount={lensAccount}
          onPostCreated={getPosts}
        />

        {posts.length === 0 && (
          <Box color="#aab" fontSize="14px" textAlign="center" mt="40px">
            No posts found. Be the first to post!
          </Box>
        )}

        {posts.map((post) =>
          post.__typename === "Post" ? (
            <PostCard
              key={post.id}
              post={post}
              accessToken={accessToken}
              lensAccount={lensAccount}
            />
          ) : null,
        )}
      </Box>

      {/* FRIEND SUGGESTIONS */}
      <Box
        width="30%"
        backgroundColor="rgba(5, 32, 64, 0.9)"
        padding="40px 25px"
        borderRadius="6px"
        height="fit-content"
      >
        <Box fontFamily="DM Serif Display">FRIEND SUGGESTIONS</Box>
        {profiles.map((profile) => (
          <Box
            key={profile.address}
            margin="30px 0"
            display="flex"
            alignItems="center"
            height="40px"
            _hover={{ color: "#808080", cursor: "pointer" }}
            onClick={() => navigate(`/profile/${profile.address}`)}
          >
            <img
              alt="profile"
              src={parseImageUrl(profile.metadata?.picture)}
              width="40px"
              height="40px"
              style={{ borderRadius: "50%" }}
              onError={(e) => {
                e.currentTarget.src = "/default-avatar.png";
              }}
            />
            <Box marginLeft="15px">
              <Box fontWeight="bold" fontSize="13px">
                {profile.metadata?.name}
              </Box>
              <Box fontSize="12px" color="#aab">
                @{profile.username?.localName}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const [account, setAccount] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [lensAccount, setLensAccount] = useState(null);

  async function signIn() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);

      const accountResponse = await urlClient
        .query(
          `query {
            accountsAvailable(request: { managedBy: "${connectedAccount}", includeOwned: true }) {
              items {
                ... on AccountOwned {
                  account {
                    address
                    username { localName }
                  }
                }
              }
            }
          }`,
        )
        .toPromise();

      const la =
        accountResponse.data?.accountsAvailable?.items?.[0]?.account?.address;
      if (!la) {
        alert("No Lens account found! Please create one at hey.xyz first.");
        return;
      }
      setLensAccount(la);

      const challengeResponse = await urlClient
        .mutation(CHALLENGE_MUTATION, {
          request: { accountOwner: { account: la, owner: connectedAccount } },
        })
        .toPromise();

      const { id, text } = challengeResponse.data.challenge;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(text);

      const authResponse = await urlClient
        .mutation(AUTHENTICATE_MUTATION, { request: { id, signature } })
        .toPromise();

      const token = authResponse.data?.authenticate?.accessToken;
      setAccessToken(token);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  }

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
            <Box fontSize="13px" color="#aab">
              Decentralized Social Media App
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap="12px">
            {lensAccount && (
              <Box
                cursor="pointer"
                color="#7a9bbf"
                fontSize="13px"
                _hover={{ color: "white" }}
                onClick={() => {
                  window.location.href = `/profile/${lensAccount}`;
                }}
              >
                My Profile
              </Box>
            )}
            {account ? (
              <Box
                backgroundColor="#000"
                padding="12px 15px"
                borderRadius="6px"
                fontSize="13px"
              >
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
      </Box>

      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            <Feed
              account={account}
              accessToken={accessToken}
              lensAccount={lensAccount}
              signIn={signIn}
            />
          }
        />
        <Route
          path="/profile/:address"
          element={
            // <ProfilePage
            //   accessToken={accessToken}
            //   currentUserAddress={lensAccount}
            // />
            <ProfilePageOriginal
              accessToken={accessToken}
              currentUserAddress={lensAccount}
            />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
