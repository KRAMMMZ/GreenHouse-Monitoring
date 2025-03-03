import React from "react";
import {
  Container,
  Paper,
  Box,
  Skeleton,
  Grid,
} from "@mui/material";

const AnalyticsDashboardSkeleton = () => {
  return (
    <Container maxWidth="xxl" sx={{ paddingTop: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#FDFCFB",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          borderRadius: "15px",
        }}
      >
        {/* Harvest Analytics Skeleton */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          mb={5}
        >
          <Skeleton variant="text" width={250} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>

        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "20px" }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                backgroundColor: "#06402B",
                borderRadius: "10px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Skeleton variant="text" width="80%" height={40} sx={{ alignSelf: "center", mb: 3 }} />
              <Grid container spacing={2} sx={{ flex: 1 }}>
                {Array.from(new Array(4)).map((_, index) => (
                  <Grid item xs={6} key={index}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Rejection Analytics Skeleton */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          mb={5}
          mt={5}
        >
          <Skeleton variant="text" width={250} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>

        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "20px" }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                backgroundColor: "#06402B",
                borderRadius: "10px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Skeleton variant="text" width="80%" height={40} sx={{ alignSelf: "center", mb: 3 }} />
              <Grid container spacing={2} sx={{ flex: 1 }}>
                {Array.from(new Array(4)).map((_, index) => (
                  <Grid item xs={6} key={index}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AnalyticsDashboardSkeleton;
