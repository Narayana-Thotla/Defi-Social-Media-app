
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Spinner } from "@chakra-ui/react";
import { urlClient } from "./qqueries";
import { FETCH_PROFILE_QUERY, FETCH_ACCOUNT_POSTS_QUERY } from "./qqueries";

function ProfilePage({ accessToken, currentUserAddress }) {
  const { address } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followerCount, setFollowerCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("ipfs:")) {
      return `https://gateway.pinata.cloud/ipfs/${url.split("//")[1]}`;
    }
    return url;
  };

  useEffect(() => {
    if (!address) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch profile
        const profileRes = await urlClient
          .query(FETCH_PROFILE_QUERY, { address })
          .toPromise();

        console.log("Profile:", profileRes);

        if (profileRes.error || !profileRes.data?.account) {
          setError(
            profileRes.error?.message || `No profile found for: ${address}`
          );
          setLoading(false);
          return;
        }

        setProfile(profileRes.data.account);

        // 2. Fetch posts
        const postsRes = await urlClient
          .query(FETCH_ACCOUNT_POSTS_QUERY, { address })
          .toPromise();
        setPosts(postsRes.data?.posts?.items || []);

        // 3. Fetch follower + following counts
        // accountStats → graphFollowStats → followers / following
        const statsRes = await urlClient
          .query(
            `query GetAccountStats($address: EvmAddress!) {
              accountStats(request: { account: $address }) {
                graphFollowStats {
                  followers
                  following
                }
              }
            }`,
            { address }
          )
          .toPromise();

        console.log("Stats:", statsRes);

        setFollowerCount(
          statsRes.data?.accountStats?.graphFollowStats?.followers ?? "—"
        );
        setFollowingCount(
          statsRes.data?.accountStats?.graphFollowStats?.following ?? "—"
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
      }

      setLoading(false);
    }

    load();
  }, [address]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt="80px">
        <Spinner color="white" size="xl" />
      </Box>
    );

  if (error)
    return (
      <Box color="white" textAlign="center" mt="80px" px="20px">
        <Box fontSize="18px" mb="10px" color="#e05a7a">
          Profile Error
        </Box>
        <Box
          fontSize="13px"
          color="#aab"
          maxWidth="500px"
          margin="0 auto"
          mb="10px"
        >
          {error}
        </Box>
        <Box fontSize="11px" color="#445" mb="20px">
          Address: {address}
        </Box>
        <Button
          size="sm"
          onClick={() => navigate(-1)}
          backgroundColor="#1a4a7a"
          color="white"
        >
          ← Go Back
        </Button>
      </Box>
    );

  if (!profile)
    return (
      <Box color="white" textAlign="center" mt="80px">
        <Box mb="15px">Profile not found.</Box>
        <Button
          size="sm"
          onClick={() => navigate(-1)}
          backgroundColor="#1a4a7a"
          color="white"
        >
          ← Go Back
        </Button>
      </Box>
    );

  const coverUrl = parseImageUrl(profile.metadata?.coverPicture);
  const avatarUrl = parseImageUrl(profile.metadata?.picture);

  return (
    <Box width="55%" margin="0 auto" color="white">
      {/* Back button */}
      <Box pt="20px" mb="10px">
        <Button
          size="sm"
          onClick={() => navigate(-1)}
          backgroundColor="rgba(5,32,64)"
          color="white"
          border="1px solid #555"
          _hover={{ backgroundColor: "#111" }}
        >
          ← Back
        </Button>
      </Box>

      {/* Cover photo */}
      <Box
        height="200px"
        borderRadius="10px"
        overflow="hidden"
        backgroundColor="#0a1628"
        backgroundImage={
          coverUrl && coverUrl !== "/default-avatar.png"
            ? `url(${coverUrl})`
            : "none"
        }
        backgroundSize="cover"
        backgroundPosition="center"
      />

      {/* Avatar + Info */}
      <Box
        backgroundColor="rgba(5,32,64,0.9)"
        borderRadius="10px"
        padding="20px 30px"
        mt="-40px"
        position="relative"
        display="flex"
        gap="20px"
        alignItems="flex-end"
      >
        <img
          src={avatarUrl}
          alt="avatar"
          width="90px"
          height="90px"
          style={{
            borderRadius: "50%",
            border: "3px solid #1a4a7a",
            flexShrink: 0,
          }}
          onError={(e) => {
            e.currentTarget.src = "/default-avatar.png";
          }}
        />
        <Box flexGrow={1}>
          <Box fontFamily="DM Serif Display" fontSize="26px">
            {profile.metadata?.name || profile.username?.localName}
          </Box>
          <Box fontSize="14px" color="#aab" mb="6px">
            @{profile.username?.localName}
          </Box>
          {profile.metadata?.bio && (
            <Box fontSize="13px" color="#ccd" mb="10px">
              {profile.metadata.bio}
            </Box>
          )}

          {/* Stats row */}
          <Box display="flex" gap="30px" fontSize="14px" color="#aab">
            <Box>
              <span style={{ color: "white", fontWeight: "bold" }}>
                {posts.length}
              </span>{" "}
              Posts
            </Box>
            <Box>
              <span style={{ color: "white", fontWeight: "bold" }}>
                {followerCount !== null ? (
                  followerCount
                ) : (
                  <Spinner size="xs" color="white" />
                )}
              </span>{" "}
              Followers
            </Box>
            <Box>
              <span style={{ color: "white", fontWeight: "bold" }}>
                {followingCount !== null ? (
                  followingCount
                ) : (
                  <Spinner size="xs" color="white" />
                )}
              </span>{" "}
              Following
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Posts list */}
      <Box mt="25px" pb="40px">
        <Box fontFamily="DM Serif Display" fontSize="20px" mb="15px">
          Posts
        </Box>
        {posts.length === 0 ? (
          <Box color="#aab" fontSize="14px">
            No posts yet.
          </Box>
        ) : (
          posts.map((post) => (
            <Box
              key={post.id}
              backgroundColor="rgba(5,32,64,0.9)"
              borderRadius="8px"
              padding="20px"
              mb="15px"
            >
              <Box fontSize="14px" mb="8px">
                {post.metadata?.content}
              </Box>
              <Box display="flex" gap="20px" fontSize="12px" color="#7a9bbf">
                <span>💬 {post.stats?.comments ?? 0}</span>
                <span>🔁 {post.stats?.reposts ?? 0}</span>
                <span>❤️ {post.stats?.reactions ?? 0}</span>
                <span style={{ marginLeft: "auto" }}>
                  {new Date(post.timestamp).toLocaleDateString()}
                </span>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export default ProfilePage;