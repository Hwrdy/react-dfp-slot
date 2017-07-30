/* eslint-disable import/first, func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import DFPProvider from '../src/DFPProvider';

global.googletag = {
  cmd: {
    push: jest.fn(),
  },
};

const storeFake = (state) => {
  return {
    default: () => {},
    subscribe: () => {},
    dispatch: jest.fn(),
    getState: () => {
      return { ...state };
    },
  };
};

describe('component <DFPProvider />', () => {
  let makeSubject;
  let subject;
  let testProps;

  beforeEach(() => {
    jest.resetModules();

    global.__SERVER__ = false;
    global.__CLIENT__ = true;

    const store = storeFake();

    testProps = {
      children: <div />,
    };

    makeSubject = () => {
      return mount(
        <DFPProvider
          {...testProps}
        />,
        {
          context: {
            store,
          },
          childContextTypes: {
            store: PropTypes.object,
          },
        },
      );
    };

    subject = makeSubject();
  });

  it('should render correctly', () => {
    expect(subject.find(DFPProvider).length).toEqual(1);
  });
});
