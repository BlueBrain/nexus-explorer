import * as React from 'react';
import { Avatar, Tooltip, Tag } from 'antd';
import * as Identicon from 'identicon.js';
import './Types.less';
import * as md5 from 'md5';
const { getPaletteFromURL } = require('color-thief-node');

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(component: number) {
  const hex = component.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export interface TypesIconProps {
  type: string[];
}

// type represents the field @type
const TypesIcon: React.SFC<TypesIconProps> = ({ type }) => {
  return (
    <ul className="types-list">
      {type.map((type, index) => {
        const [color, setColor] = React.useState<string | null>(null);
        const typeString = type.toString();
        // must use a hash as Identicon requires a string of atleast 15 chars
        // (making the resulting image effectively a visual hash)
        const typeHash = md5(typeString);
        const iconSizeInPixels = 20;
        const imageData = new Identicon(typeHash, iconSizeInPixels).toString();
        const src = `data:image/png;base64,${imageData}`;
        if (!color) {
          getPaletteFromURL(src).then((colors: [number, number, number][]) => {
            const hexColors = colors.map(color => rgbToHex.apply(null, color));
            setColor(hexColors[1]);
          });
        }
        let style = {};
        if (color) {
          style = {
            color,
            backgroundColor: `${color}20`,
            border: `1px solid ${color}`,
          };
        }
        return (
          <li className="types-icon" key={`${typeHash}-${index}`}>
            <Tooltip title={typeString}>
              <Tag {...{ style }}>
                <Avatar size="small" shape="square" src={src} />
                <span className="label">{typeString}</span>
              </Tag>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
};

export default TypesIcon;
