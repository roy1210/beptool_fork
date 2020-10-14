import { createGlobalStyle } from 'styled-components';
import { generateMedia } from 'styled-media-query';
import { theme } from './theme';

export const customMedia = generateMedia({
  desktop: '1296px',
  laptop: '1172px',
  tablet: '768px',
  mobile: '400px',
});

export const GlobalStyle = createGlobalStyle`
  .Center{
    text-align: center !important;
  }
`;
