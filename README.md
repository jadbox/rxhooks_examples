## Just Show Me the Code

import React, { useState, useEffect, useRef } from 'react';
import useRx from 'useRx';
import {from, interval} from 'rxjs';

function Counter() {
  let [count, setCount] = useRx(1000, () => {
    // Your steam
    return interval(1000)
  });

  return <h1>{count}</h1>;
}