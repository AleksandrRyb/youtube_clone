import { Menu, MenuButton, MenuItem, MenuList } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { useAuth } from "context/auth-context";
import React from "react";
import { deleteVideo } from "utils/api-client";
import { DeleteIcon, SettingsIcon } from "./Icons";

function DeleteVideoDropdown({ video }) {
  const user = useAuth();

  const isVideoAuthor = video.user.id === user.id;

  if (isVideoAuthor) {
    return (
      <div>
        <Menu>
          <MenuButton>
            <SettingsIcon />
          </MenuButton>
          <MenuList>
            <MenuItem onSelect={() => deleteVideo(video.id)}>
              <DeleteIcon />
              <span>Delete Video</span>
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    );
  }

  return null;
}

export default DeleteVideoDropdown;
