import styled from 'styled-components';

export const TimeLockFormContainer = styled.div`
  .time-picker {
    width: 100%;
    .react-datetime-picker__wrapper {
      text-align: right;
    }
  }
  .react-datetime-picker,
  .react-datetime-picker *,
  .react-datetime-picker *:before,
  .react-datetime-picker *:after {
    box-sizing: border-box;
    border-color: transparent !important;
    border-radius: 4px;
  }
  .react-datetime-picker__inputGroup__month,
  .react-datetime-picker__inputGroup__day,
  .react-datetime-picker__inputGroup__hour,
  .react-datetime-picker__inputGroup__minute {
    width: 17px !important;
  }
  .react-datetime-picker__inputGroup__year {
    width: 33px !important;
  }
`;
