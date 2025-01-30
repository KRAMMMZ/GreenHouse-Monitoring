import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Typography,
  Box
} from "@mui/material";

function Reports() {
  const [loading] = useState(true); // Simulate loading state

  return (
    <div className="container-fluid p-3">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
         
          
          REPORTS
        
      </Typography>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: 3,
          padding: 2,
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650, backgroundColor: "#d8d8d8" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#4169E1", borderRadius: "10px" }}>
                {["Report ID", "Type", "Generated Date", "Status", "Actions"].map((header) => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      fontSize: "1.1rem",
                      py: 2.5
                    }}
                  >
                    {loading ? (
                      <Skeleton
                        variant="text"
                        sx={{ 
                          width: '70%', 
                          mx: 'auto',
                          bgcolor: "rgba(255, 255, 255, 0.8)"
                        }}
                      />
                    ) : (
                      header
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(loading ? Array.from(new Array(5)) : []).map((_, index) => (
                <TableRow key={index} hover sx={{ borderRadius: "10px" }}>
                  {[...Array(5)].map((_, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      align="center"
                      sx={{ fontSize: "1.0rem", py: 1.5 }}
                    >
                      <Skeleton
                        variant="text"
                        sx={{ width: '80%', mx: 'auto' }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Skeleton
              variant="rectangular"
              width={300}
              height={40}
              sx={{ borderRadius: "4px" }}
            />
          </Box>
        )}
      </Paper>
    </div>
  );
}

export default Reports;