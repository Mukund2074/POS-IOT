import React, {forwardRef} from 'react';

import {Action} from '../Action';

export const Handle = forwardRef(
  (props, ref) => {
    if(props.item){
      return (
  <Action
        ref={ref}
        cursor="grab"
        data-cypress="draggable-handle"
        {...props}
      >
    <svg width="18" height="16" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2H19" stroke="#A0A0A0" stroke-width="3" stroke-linecap="round"/>
      <path d="M2 9H19" stroke="#A0A0A0" stroke-width="3" stroke-linecap="round"/>
      <path d="M2 16H19" stroke="#A0A0A0" stroke-width="3" stroke-linecap="round"/>
      </svg>


      </Action>)
    }
    return (
      <Action
        ref={ref}
        cursor="grab"
        data-cypress="draggable-handle"
        {...props}
      >
      <svg width="18" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 2H21" stroke="#737373" stroke-width="3" stroke-linecap="round"/>
      <path d="M7 8H21" stroke="#737373" stroke-width="3" stroke-linecap="round"/>
      <path d="M7 14H21" stroke="#737373" stroke-width="3" stroke-linecap="round"/>
      <path d="M2 2H3" stroke="#737373" stroke-width="3" stroke-linecap="round"/>
      <path d="M2 8H3" stroke="#737373" stroke-width="3" stroke-linecap="round"/>
      <path d="M2 14H3" stroke="#737373" stroke-width="3" stroke-linecap="round"/>
      </svg>

      </Action>
    );
  }
);
