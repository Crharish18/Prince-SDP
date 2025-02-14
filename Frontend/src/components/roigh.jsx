import React, { useState } from "react";
import { Box, Drawer, List, ListItem, ListItemText, Divider, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import * as Icons from "@mui/icons-material";

const routeConfig = [
    { title: "Dashboard", path: "/adminDashboard", icon: "HomeOutlined", color: "#4caf50" },
    { title: "Manage Members", path: "/members", icon: "PeopleOutlined", color: "#2196f3" },
    { title: "Manage Trainers", path: "/trainers", icon: "SportsOutlined", color: "#ff9800" },
    { title: "Attendance", path: "/attendance", icon: "AccessTimeOutlined", color: "#9c27b0" },
    { title: "Manage Plans", path: "/plans", icon: "AssignmentOutlined", color: "#f44336" },
    { title: "Announcements", path: "/announcements", icon: "CampaignOutlined", color: "#3f51b5" },
    { title: "Gym Equipments", path: "/equipments", icon: "FitnessCenterOutlined", color: "#00bcd4" },
    { title: "Manage Supplements", path: "/supplements", icon: "LocalPharmacyOutlined", color: "#8bc34a" },
    { title: "View Schedules", path: "/schedules", icon: "EventOutlined", color: "#ffc107" },
    { title: "Payments", path: "/payments", icon: "PaymentOutlined", color: "#e91e63" },
    { title: "Report", path: "/report", icon: "AssessmentOutlined", color: "#009688" },
];

const AdminSideBar = () => {
    const location = useLocation();
    const currentTitle = routeConfig.find((r) => r.path === location.pathname)?.title || "Dashboard";

    const [isCollapsed] = useState(false);
    const styles = {
        sidebarBg: "#1a1b23", textColor: "#a4a1b6", iconBg: "#262626", activeBg: "#3c1e1e",
        activeText: "#e3e3e8", fontSize: "14.5px", iconSize: "17px"
    };

    const Item = ({ title, path, icon, color }) => {
        const isActive = location.pathname === path;
        const IconComponent = Icons[icon];

        return (
            <ListItem button component={Link} to={path} sx={{
                backgroundColor: isActive ? styles.activeBg : "transparent",
                color: isActive ? styles.activeText : styles.textColor,
                padding: "8px 15px", borderRadius: "4px", borderLeft: isActive ? "9px solid #590404" : "4px solid transparent",
                "&:hover": { backgroundColor: styles.activeBg, color: styles.activeText },
            }}>
                <Box sx={{
                    width: "35px", height: "35px", borderRadius: "50%", backgroundColor: isActive ? styles.activeBg : styles.iconBg,
                    display: "flex", justifyContent: "center", alignItems: "center", marginRight: "10px",
                    "&:hover": { backgroundColor: styles.activeBg },
                }}>
                    <IconComponent sx={{ fontSize: styles.iconSize, color: isActive ? styles.activeText : color }} />
                </Box>
                <ListItemText primary={title} />
            </ListItem>
        );
    };

    return (
        <>
                       <Box sx={{ display: "flex" }}>
                <Drawer variant="permanent" open sx={{
                    width: isCollapsed ? 80 : 240, transition: "width 0.3s",
                    "& .MuiDrawer-paper": {
                        width: isCollapsed ? 80 : 240, height: "92vh", marginTop: "8.8vh", padding: "25px 0",
                        backgroundColor: styles.sidebarBg, overflow: "hidden",
                        "&:hover": { overflowY: "auto" }, scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    },
                }}>
                    <Divider sx={{ backgroundColor: "#86868e", margin: "10px 0", marginTop: "-25px", marginBottom: "20px" }} />
                    <Typography variant="h6" sx={{
                        color: styles.textColor, padding: "1px 110px 10px 0", fontWeight: "bold", letterSpacing: "1px",
                        fontSize: "13px",
                    }}>
                        Navigation
                    </Typography>
                    <List>
                        {routeConfig.map(({ title, path, icon, color }) => (
                            <Item key={path} title={title} path={path} icon={icon} color={color} />
                        ))}
                    </List>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, padding: "20px" }}></Box>
            </Box>
        </>
    );
};

export default AdminSideBar;