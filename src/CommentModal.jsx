// // ─── DROP-IN REPLACEMENT for the CommentModal in App.jsx ────────────────────
// // The fix: commentOn must be passed as { id: postId } — a ReferencingPostInput object.
// // Previously it was being passed as a plain string which caused the GraphQL error.

// import { useEffect, useState } from "react";
// import { Box, Button, Textarea, Spinner } from "@chakra-ui/react";
// import { urlClient } from "./qqueries";
// import { COMMENT_ON_POST_MUTATION, FETCH_COMMENTS_QUERY } from "./qqueries";

// const parseImageUrl = (url) => {
//   if (!url) return "/default-avatar.png";
//   if (url.startsWith("ipfs:")) {
//     return `https://gateway.pinata.cloud/ipfs/${url.split("//")[1]}`;
//   }
//   return url;
// };

// const authHeaders = (token) => ({
//   fetchOptions: { headers: { Authorization: `Bearer ${token}` } },
// });

// export function CommentModal({ post, accessToken, onClose }) {
//   const [comments, setComments] = useState([]);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);

//   useEffect(() => {
//     async function load() {
//       const res = await urlClient
//         .query(FETCH_COMMENTS_QUERY, { postId: post.id })
//         .toPromise();
//       console.log("Comments response:", res);
//       setComments(res.data?.posts?.items || []);
//       setFetching(false);
//     }
//     load();
//   }, [post.id]);

//   async function submitComment() {
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
//           COMMENT_ON_POST_MUTATION,
//           {
//             request: {
//               contentUri: `data:application/json,${encodeURIComponent(
//                 JSON.stringify(metadata)
//               )}`,
//               // ✅ THE FIX: commentOn is a ReferencingPostInput { id: string }
//               // NOT a plain string — this was causing the GraphQL error
//               commentOn: { id: post.id },
//             },
//           },
//           authHeaders(accessToken)
//         )
//         .toPromise();

//       console.log("Comment result:", result);

//       if (result.error) throw new Error(result.error.message);

//       const postResponse = result.data?.post;
//       if (postResponse?.reason) {
//         throw new Error(postResponse.reason);
//       }

//       // Optimistically prepend the new comment
//       setComments((prev) => [
//         {
//           id: Date.now(),
//           metadata: { content: text },
//           author: {
//             username: { localName: "you" },
//             metadata: { picture: null },
//           },
//           timestamp: new Date().toISOString(),
//         },
//         ...prev,
//       ]);
//       setText("");
//     } catch (err) {
//       console.error("Comment error:", err);
//       alert("Comment failed: " + err.message);
//     }

//     setLoading(false);
//   }

//   return (
//     <Box
//       position="fixed"
//       top="0"
//       left="0"
//       width="100vw"
//       height="100vh"
//       backgroundColor="rgba(0,0,0,0.75)"
//       display="flex"
//       alignItems="center"
//       justifyContent="center"
//       zIndex="1000"
//       onClick={onClose}
//     >
//       <Box
//         backgroundColor="#0a1628"
//         borderRadius="10px"
//         padding="30px"
//         width="500px"
//         maxHeight="80vh"
//         overflowY="auto"
//         onClick={(e) => e.stopPropagation()}
//         color="white"
//       >
//         <Box fontFamily="DM Serif Display" fontSize="20px" mb="15px">
//           Comments on @{post.author?.username?.localName}'s post
//         </Box>

//         {/* Original post preview */}
//         <Box
//           backgroundColor="rgba(255,255,255,0.05)"
//           borderRadius="8px"
//           padding="12px"
//           mb="15px"
//           fontSize="13px"
//           color="#ccd"
//         >
//           {post.metadata?.content}
//         </Box>

//         {/* Comment input */}
//         {accessToken ? (
//           <Box mb="20px">
//             <Textarea
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               placeholder="Write a comment..."
//               backgroundColor="#0d1f3c"
//               color="white"
//               border="1px solid #1a4a7a"
//               borderRadius="6px"
//               mb="8px"
//               _placeholder={{ color: "#556" }}
//             />
//             <Button
//               onClick={submitComment}
//               isLoading={loading}
//               isDisabled={!text.trim()}
//               size="sm"
//               backgroundColor="#1a4a7a"
//               color="white"
//               _hover={{ backgroundColor: "#2a6aaa" }}
//             >
//               Post Comment
//             </Button>
//           </Box>
//         ) : (
//           <Box mb="15px" fontSize="13px" color="#aab">
//             Sign in to comment.
//           </Box>
//         )}

//         {/* Comments list */}
//         {fetching ? (
//           <Spinner color="white" />
//         ) : comments.length === 0 ? (
//           <Box color="#aab" fontSize="13px">
//             No comments yet. Be the first!
//           </Box>
//         ) : (
//           comments.map((c) => (
//             <Box
//               key={c.id}
//               display="flex"
//               gap="10px"
//               mb="12px"
//               alignItems="flex-start"
//             >
//               <img
//                 src={parseImageUrl(c.author?.metadata?.picture)}
//                 width="32px"
//                 height="32px"
//                 style={{ borderRadius: "50%", flexShrink: 0 }}
//                 onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
//                 alt="avatar"
//               />
//               <Box>
//                 <Box fontSize="12px" color="#7a9bbf" mb="2px">
//                   @{c.author?.username?.localName}
//                 </Box>
//                 <Box fontSize="13px">{c.metadata?.content}</Box>
//               </Box>
//             </Box>
//           ))
//         )}

//         <Box mt="20px" textAlign="right">
//           <Button
//             size="sm"
//             onClick={onClose}
//             backgroundColor="transparent"
//             color="#aab"
//             border="1px solid #333"
//           >
//             Close
//           </Button>
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// ─── COMMENT MODAL COMPONENT ────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Box, Button, Textarea, Spinner } from "@chakra-ui/react";
import { urlClient } from "./qqueries";
import { COMMENT_ON_POST_MUTATION, FETCH_COMMENTS_QUERY } from "./qqueries";

const parseImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("ipfs:")) {
    return `https://gateway.pinata.cloud/ipfs/${url.split("//")[1]}`;
  }
  return url;
};

const authHeaders = (token) => ({
  fetchOptions: { headers: { Authorization: `Bearer ${token}` } },
});

export function CommentModal({ post, accessToken, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await urlClient
        .query(FETCH_COMMENTS_QUERY, { postId: post.id })
        .toPromise();
      console.log("Comments response:", res);
      setComments(res.data?.posts?.items || []);
      setFetching(false);
    }
    load();
  }, [post.id]);

  async function submitComment() {
    if (!text.trim() || !accessToken) return;
    setLoading(true);

    try {
      const metadata = {
        $schema:
          "https://json-schemas.lens.dev/publications/text-only/3.0.0.json",
        lens: {
          mainContentFocus: "TEXT_ONLY",
          content: text,
          locale: "en",
          tags: [],
        },
      };

      const result = await urlClient
        .mutation(
          COMMENT_ON_POST_MUTATION,
          {
            request: {
              contentUri: `data:application/json,${encodeURIComponent(
                JSON.stringify(metadata)
              )}`,
              // ✅ THE FIX: Lens v3 expects { post: postId } not { id: postId }
              commentOn: { post: post.id },
            },
          },
          authHeaders(accessToken)
        )
        .toPromise();

      console.log("Comment result:", result);

      if (result.error) throw new Error(result.error.message);

      const postResponse = result.data?.post;
      if (postResponse?.reason) throw new Error(postResponse.reason);

      // Optimistically prepend
      setComments((prev) => [
        {
          id: Date.now(),
          metadata: { content: text },
          author: {
            username: { localName: "you" },
            metadata: { picture: null },
          },
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      setText("");
    } catch (err) {
      console.error("Comment error:", err);
      alert("Comment failed: " + err.message);
    }

    setLoading(false);
  }

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      backgroundColor="rgba(0,0,0,0.75)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1000"
      onClick={onClose}
    >
      <Box
        backgroundColor="#0a1628"
        borderRadius="10px"
        padding="30px"
        width="500px"
        maxHeight="80vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
        color="white"
      >
        <Box fontFamily="DM Serif Display" fontSize="20px" mb="15px">
          Comments on @{post.author?.username?.localName}'s post
        </Box>

        {/* Original post preview */}
        <Box
          backgroundColor="rgba(255,255,255,0.05)"
          borderRadius="8px"
          padding="12px"
          mb="15px"
          fontSize="13px"
          color="#ccd"
        >
          {post.metadata?.content}
        </Box>

        {/* Comment input */}
        {accessToken ? (
          <Box mb="20px">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              backgroundColor="#0d1f3c"
              color="white"
              border="1px solid #1a4a7a"
              borderRadius="6px"
              mb="8px"
              _placeholder={{ color: "#556" }}
            />
            <Button
              onClick={submitComment}
              isLoading={loading}
              isDisabled={!text.trim()}
              size="sm"
              backgroundColor="#1a4a7a"
              color="white"
              _hover={{ backgroundColor: "#2a6aaa" }}
            >
              Post Comment
            </Button>
          </Box>
        ) : (
          <Box mb="15px" fontSize="13px" color="#aab">
            Sign in to comment.
          </Box>
        )}

        {/* Comments list */}
        {fetching ? (
          <Spinner color="white" />
        ) : comments.length === 0 ? (
          <Box color="#aab" fontSize="13px">
            No comments yet. Be the first!
          </Box>
        ) : (
          comments.map((c) => (
            <Box key={c.id} display="flex" gap="10px" mb="12px" alignItems="flex-start">
              <img
                src={parseImageUrl(c.author?.metadata?.picture)}
                width="32px"
                height="32px"
                style={{ borderRadius: "50%", flexShrink: 0 }}
                onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                alt="avatar"
              />
              <Box>
                <Box fontSize="12px" color="#7a9bbf" mb="2px">
                  @{c.author?.username?.localName}
                </Box>
                <Box fontSize="13px">{c.metadata?.content}</Box>
              </Box>
            </Box>
          ))
        )}

        <Box mt="20px" textAlign="right">
          <Button
            size="sm"
            onClick={onClose}
            backgroundColor="transparent"
            color="#aab"
            border="1px solid #333"
          >
            Close
          </Button>
        </Box>
      </Box>
    </Box>
  );
}