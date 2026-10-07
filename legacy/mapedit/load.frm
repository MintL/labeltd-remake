VERSION 5.00
Begin VB.Form Form1 
   Caption         =   "Form1"
   ClientHeight    =   7575
   ClientLeft      =   60
   ClientTop       =   345
   ClientWidth     =   11400
   LinkTopic       =   "Form1"
   ScaleHeight     =   7575
   ScaleWidth      =   11400
   StartUpPosition =   3  'Windows Default
   Begin VB.Label lblback 
      BackColor       =   &H8000000C&
      Height          =   2535
      Index           =   0
      Left            =   6480
      TabIndex        =   1
      Top             =   4680
      Width           =   975
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   225
      Left            =   4560
      TabIndex        =   0
      Top             =   2280
      Width           =   495
   End
   Begin VB.Line lin 
      Index           =   0
      X1              =   4560
      X2              =   4560
      Y1              =   1680
      Y2              =   3120
   End
End
Attribute VB_Name = "Form1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit


Private Sub Form_Load()
Dim textline As String
Dim linenum As Integer
Dim lineantal As Integer
Dim max_bricks As Integer

    Open App.Path & "\test.txt" For Input As #1
    
    Do While Not EOF(1)
        Line Input #1, textline
        
        If linenum > 4 Then
        linenum = 1
        lineantal = lineantal + 1
        End If
        
        Select Case linenum
            Case 0
                max_bricks = Val(textline)
            Case 1
            If lineantal > 0 Then
                Load lin(lineantal)
                Load lblback(lineantal)
            End If
                lin(lineantal).Visible = True
                lblback(lineantal).Visible = True
                lblback(lineantal).ZOrder 1
                lin(lineantal).ZOrder 0
                lin(lineantal).X1 = Val(textline)
            Case 2
                lin(lineantal).X2 = Val(textline)
            Case 3
                lin(lineantal).Y1 = Val(textline)
            Case 4
                lin(lineantal).Y2 = Val(textline)
        End Select
        If lin(lineantal).X1 < lin(lineantal).X2 And lin(lineantal).Y1 = lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X1 - 100
        lblback(lineantal).Top = lin(lineantal).Y1 - 250
        lblback(lineantal).Width = lin(lineantal).X2 - lin(lineantal).X1 + 700
        lblback(lineantal).Height = 700
        ElseIf lin(lineantal).X1 > lin(lineantal).X2 And lin(lineantal).Y1 = lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X2 - 100
        lblback(lineantal).Top = lin(lineantal).Y1 - 250
        lblback(lineantal).Width = lin(lineantal).X1 - lin(lineantal).X2 + 700
        lblback(lineantal).Height = 700
        ElseIf lin(lineantal).X1 = lin(lineantal).X2 And lin(lineantal).Y1 < lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X2 - 100
        lblback(lineantal).Top = lin(lineantal).Y1 - 250
        lblback(lineantal).Width = 700
        lblback(lineantal).Height = lin(lineantal).Y2 - lin(lineantal).Y1 + 300
        ElseIf lin(lineantal).X1 = lin(lineantal).X2 And lin(lineantal).Y1 > lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X2 - 100
        lblback(lineantal).Top = lin(lineantal).Y2 - 250
        lblback(lineantal).Width = 700
        lblback(lineantal).Height = lin(lineantal).Y1 - lin(lineantal).Y2 + 300
        
        End If
        
        linenum = linenum + 1
        
    Loop
    Close #1

End Sub
