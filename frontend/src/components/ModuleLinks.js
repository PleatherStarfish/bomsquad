import React from 'react';
import Button from '../ui/Button'
import { LinkIcon } from "@heroicons/react/24/outline";

function ModuleLinks({ module }) {
  return (
    <div className="flex flex-wrap gap-2">
      {module.manufacturer_page_link && (
        <a href={module.manufacturer_page_link}>
          <Button variant='light' Icon={LinkIcon} iconLocation='right'>
            Manufacturer page link
          </Button>
        </a>
      )}

      {module.bom_link && (
        <a href={module.bom_link}>
          <Button variant='light' Icon={LinkIcon} iconLocation='right'>
              BOM link
          </Button>
        </a>
      )}

      {module.manual_link && (
        <a href={module.manual_link}>
          <Button variant='light' Icon={LinkIcon} iconLocation='right'>
              Manual link
          </Button>
        </a>
      )}

      {module.modulargrid_link && (
        <a href={module.modulargrid_link}>
          <Button variant='light' Icon={LinkIcon} iconLocation='right'>
              Modulargrid link
          </Button>
        </a>
      )}
    </div>
  );
}

export default ModuleLinks;