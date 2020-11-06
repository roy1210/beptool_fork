import { Form, Input } from 'antd';
import React from 'react';
import DateTimePicker from 'react-datetime-picker';
import { MODE } from '../../data/constants';
import { TimeLockFormContainer } from '../../styles/Components/TimeLockForm.styles';
import { Button, Text } from '../pages/Components';

const TimeLockForm = (props) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        if (props.onSubmit) {
          props.onSubmit(values);
        }
        props.form.resetFields();
      }
    });
  };

  const { getFieldDecorator } = props.form;

  return (
    <TimeLockFormContainer>
      <Form onSubmit={handleSubmit} className='login-form'>
        {props.mode !== MODE.TIMEUNLOCK && (
          <Form.Item label='Amount'>
            {getFieldDecorator('amount', {
              rules: [
                {
                  required: true,
                  message: 'Please input an amount of tokens!',
                },
              ],
              initialValue: props.lockTx ? props.lockTx.amount[0].amount : null,
            })(<Input autoComplete='off' placeholder='Amount: ie 1.9938' />)}
          </Form.Item>
        )}
        {props.mode !== MODE.TIMEUNLOCK && (
          <Form.Item label='Description'>
            {getFieldDecorator('description', {
              rules: [
                { required: true, message: 'Please input a description!' },
              ],
              initialValue: props.lockTx ? props.lockTx.description : null,
            })(
              <Input
                autoComplete='off'
                placeholder='Description: ie timelock due to...'
              />
            )}
          </Form.Item>
        )}
        {props.mode !== MODE.TIMEUNLOCK && (
          <Form.Item>
            {getFieldDecorator('time', {
              rules: [{ required: true, message: 'Please set unlock time!' }],
            })(<DateTimePicker className='time-picker' />)}
          </Form.Item>
        )}
        {props.password && (
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: 'Please input your Password!' },
              ],
            })(<Input type='password' placeholder='Password' />)}
          </Form.Item>
        )}
        <Form.Item>
          <div style={{ float: 'right' }}>
            <Button onClick={props.onCancel}>Cancel</Button>
            <Button
              fill
              type='primary'
              htmlType='submit'
              onClick={handleSubmit}
              loading={props.loading}
              style={{ marginLeft: 10 }}>
              {props.mode}
            </Button>
            <div style={{ padding: 0, margin: 0 }}>
              <Text style={{ float: 'right' }} size={12} color='#EE5366'>
                Network Fee: {props.fee} BNB
              </Text>
            </div>
          </div>
        </Form.Item>
      </Form>
    </TimeLockFormContainer>
  );
};

export default TimeLockForm;
