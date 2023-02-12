import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import logo from '../../assets/logo.png'
import React, { FC } from 'react'
import { Button } from '../../components/Button'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

export const Header: FC = () => {
  return (
    <Stack
      border='2px solid black'
      width='100%'
      borderRadius='12px'
      height='84px'
      direction='row'
      p='16px 32px'
      boxSizing='border-box'
      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      <img src={logo} width='100px' height='50px' />
      <Stack
        spacing={32}
        direction='row'
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Typography variant='subheading'>Home</Typography>
        <Stack direction='row' spacing={4} alignItems='center'>
          <Typography variant='subheading'>Blog</Typography>
          <KeyboardArrowDownIcon />
        </Stack>
        <Typography variant='subheading'>About Us</Typography>
      </Stack>
      <Stack
        direction='row'
        spacing={12}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Button variant='outlined' text='Login' dark size='large' />
        <Button dark text='Sign up' size='large' />
      </Stack>
    </Stack>
  )
}