import Button from "../ui/Button";
import { LinkIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Module } from "../../src/types/modules";

interface ModuleLinksProps {
  module: Module;
}

const ModuleLinks: React.FC<ModuleLinksProps> = ({ module }) => {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {module.manufacturer_page_link && (
        <a href={module.manufacturer_page_link} rel="noopener noreferrer" target="_blank">
          <Button Icon={LinkIcon} iconLocation="right" variant="light">
            Manufacturer page link
          </Button>
        </a>
      )}

      {module.bom_link && (
        <a href={module.bom_link} rel="noopener noreferrer" target="_blank">
          <Button Icon={LinkIcon} iconLocation="right" variant="light">
            BOM link
          </Button>
        </a>
      )}

      {module.manual_link && (
        <a href={module.manual_link} rel="noopener noreferrer" target="_blank">
          <Button Icon={LinkIcon} iconLocation="right" variant="light">
            Manual link
          </Button>
        </a>
      )}

      {module.modulargrid_link && (
        <a href={module.modulargrid_link} rel="noopener noreferrer" target="_blank">
          <Button Icon={LinkIcon} iconLocation="right" variant="light">
            Modulargrid link
          </Button>
        </a>
      )}
    </div>
  );
};

export default ModuleLinks;
